/**
 * CMS config cho section Mock Collections tại trang chủ.
 * Admin quản lý qua CMS config key: "home/mock-collections"
 */
export type MockCollectionConfig = {
  /**
   * Danh sách ID của mock_test_collections muốn hiển thị,
   * theo đúng thứ tự admin chọn.
   * Nếu rỗng/undefined → hiển thị N collections mới nhất (xem page_size).
   */
  collection_ids?: string[];

  /**
   * Số lượng collections hiển thị khi không chỉ định collection_ids.
   * Mặc định: 5
   */
  page_size?: number;
};

