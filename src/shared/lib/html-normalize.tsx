import React from "react";

// Hàm helper để kiểm tra xem object có phải là array-like object không (object với numeric keys)
export const isArrayLikeObject = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || React.isValidElement(obj)) {
    return false;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;
  // Kiểm tra nếu tất cả keys đều là số (không cần liên tục)
  // Đây là trường hợp phổ biến khi html-react-parser trả về object với numeric keys
  return keys.every(key => !isNaN(Number(key)));
};

// Hàm helper để normalize kết quả parse từ html-react-parser
export const normalizeParseResult = (parsedResult: any, depth: number = 0): React.ReactNode => {
  if (!parsedResult) return null;
  
  // Nếu đã là React element hợp lệ, trả về trực tiếp
  if (React.isValidElement(parsedResult)) {
    return parsedResult;
  }
  
  // Kiểm tra và convert array-like object (object với numeric keys) TRƯỚC khi check Array.isArray
  // Vì có thể có object với numeric keys nhưng không phải là array thực sự
  if (typeof parsedResult === 'object' && parsedResult !== null && !React.isValidElement(parsedResult)) {
    // Kiểm tra xem có phải là array-like object không
    if (isArrayLikeObject(parsedResult)) {
      console.log(`[normalizeParseResult] Found array-like object at depth ${depth}, converting to array. Keys:`, Object.keys(parsedResult));
      // Sắp xếp keys theo thứ tự số để đảm bảo thứ tự đúng
      const sortedKeys = Object.keys(parsedResult)
        .map(k => Number(k))
        .filter(k => !isNaN(k))
        .sort((a, b) => a - b);
      
      const normalizedArray = sortedKeys.map((key, index) => {
        const item = parsedResult[key];
        const normalized = normalizeParseResult(item, depth + 1);
        // Đảm bảo normalized không phải là object không hợp lệ
        if (normalized && typeof normalized === 'object' && !React.isValidElement(normalized) && !Array.isArray(normalized)) {
          // Nếu vẫn là array-like object, normalize lại
          if (isArrayLikeObject(normalized)) {
            return normalizeParseResult(normalized, depth + 1);
          }
          console.warn(`[normalizeParseResult] Converted object value at index ${index} (key ${key}, depth ${depth}) is still an object:`, normalized);
          return <React.Fragment key={key}>{normalized}</React.Fragment>;
        }
        return normalized;
      }).filter(item => item !== null && item !== undefined);
      
      // Đảm bảo kết quả là array hợp lệ
      console.log(`[normalizeParseResult] Converted array-like object to array with ${normalizedArray.length} items at depth ${depth}`);
      return normalizedArray;
    }
    
    // Nếu là array thực sự, normalize từng phần tử đệ quy
    if (Array.isArray(parsedResult)) {
      return parsedResult.map((item, index) => {
        const normalized = normalizeParseResult(item, depth + 1);
        // Nếu normalized vẫn là object không hợp lệ, wrap trong fragment
        if (normalized && typeof normalized === 'object' && !React.isValidElement(normalized) && !Array.isArray(normalized)) {
          // Nếu vẫn là array-like object, normalize lại
          if (isArrayLikeObject(normalized)) {
            return normalizeParseResult(normalized, depth + 1);
          }
          console.warn(`[normalizeParseResult] Array item at index ${index} (depth ${depth}) is still an object:`, normalized);
          return <React.Fragment key={index}>{normalized}</React.Fragment>;
        }
        return normalized;
      }).filter(item => item !== null && item !== undefined);
    }
    
    // Nếu là object khác (không phải numeric keys), không thể render trực tiếp
    console.error(`[normalizeParseResult] Attempting to render non-numeric-key object at depth ${depth}:`, parsedResult);
    return null;
  }
  
  // Nếu là primitive (string, number, boolean), trả về trực tiếp
  return parsedResult;
};

// Wrapper component để catch và log lỗi khi render
export const SafeRender: React.FC<{ children: React.ReactNode; name?: string }> = ({ children, name = 'Unknown' }) => {
  try {
    // Luôn normalize children để đảm bảo không có object với numeric keys
    let normalized = normalizeParseResult(children, 0);
    
    // Nếu normalized là null hoặc undefined, trả về null
    if (normalized === null || normalized === undefined) {
      return null;
    }
    
    // Kiểm tra lại sau khi normalize - đảm bảo không có object với numeric keys
    if (normalized && typeof normalized === 'object' && !React.isValidElement(normalized) && !Array.isArray(normalized)) {
      console.error(`[SafeRender:${name}] Normalized result is still an invalid object:`, normalized, 'Keys:', Object.keys(normalized));
      
      // Nếu vẫn là array-like object, normalize lại
      if (isArrayLikeObject(normalized)) {
        console.log(`[SafeRender:${name}] Re-detected array-like object, normalizing again`);
        normalized = normalizeParseResult(normalized, 0);
      }
      
      // Kiểm tra lại sau lần normalize thứ 2
      if (normalized && typeof normalized === 'object' && !React.isValidElement(normalized) && !Array.isArray(normalized)) {
        console.error(`[SafeRender:${name}] Re-normalized result is still invalid, rendering error message`);
        // Thử một lần nữa với force convert
        if (isArrayLikeObject(normalized)) {
          const values = Object.values(normalized);
          normalized = values.map((item, idx) => normalizeParseResult(item, 0));
        } else {
          return <div>Error rendering content</div>;
        }
      }
    }
    
    // Đảm bảo nếu là array, tất cả phần tử đều hợp lệ
    if (Array.isArray(normalized)) {
      const invalidItems = normalized.filter(item => 
        item && typeof item === 'object' && !React.isValidElement(item) && !Array.isArray(item)
      );
      if (invalidItems.length > 0) {
        console.error(`[SafeRender:${name}] Array contains ${invalidItems.length} invalid items`);
        normalized = normalized.map((item, idx) => {
          if (item && typeof item === 'object' && !React.isValidElement(item) && !Array.isArray(item)) {
            if (isArrayLikeObject(item)) {
              return normalizeParseResult(item, 0);
            }
            return <React.Fragment key={idx}>{item}</React.Fragment>;
          }
          return item;
        });
      }
    }
    
    return <>{normalized}</>;
  } catch (error) {
    console.error(`[SafeRender:${name}] Error rendering:`, error, children);
    return <div>Error rendering content</div>;
  }
};
