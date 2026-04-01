import { Badge } from '../../atoms/badge';
import { PartTag } from '../../atoms/part-tag';
import { ProBadge } from '../../../pro-badge';

export type TestCardProps = {
  image?: string;
  title: string;
  subtitle?: string;
  skill?: 'reading' | 'listening' | 'speaking' | 'writing';
  author?: string;
  authorAvatar?: string;
  views?: number;
  attempts?: number;
  part?: 1 | 2 | 3 | 4 | 5 | string;
  isPro?: boolean;
  score?: string | number;
  actionText?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const formatViews = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

export const TestCard = ({
  image,
  title,
  subtitle,
  skill,
  author,
  authorAvatar,
  views,
  attempts,
  part,
  isPro,
  score,
  actionText = "Kiểm Tra", // default action
  href,
  onClick,
  className = '',
}: TestCardProps) => {
  const Tag = href ? 'a' : 'div';
  const linkProps = href ? { href } : {};

  return (
    <Tag 
      {...linkProps} 
      onClick={onClick}
      className={`group flex flex-col bg-white rounded-[24px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] hover:-translate-y-[6px] border border-gray-100 transition-all duration-400 cursor-pointer ${className}`}
    >
      {/* Upper Image Section */}
      <div className="relative aspect-[496/340] bg-[#FAF7EB] overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="absolute inset-[10%] w-[80%] h-[80%] object-contain transition-transform duration-500 group-hover:scale-105" 
            loading="lazy" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        
        {/* Overlays */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col gap-2">
            {part !== undefined && (
              <div className="inline-flex select-none items-center justify-center rounded-full bg-[#F2994A] px-3 py-1 text-xs font-bold text-white shadow-sm">
                Part {part}
              </div>
            )}
            {skill && (
               <Badge variant={skill} size="md">
                 {skill.charAt(0).toUpperCase() + skill.slice(1)}
               </Badge>
            )}
          </div>
          <div>
             {isPro && <ProBadge />}
          </div>
        </div>
      </div>
      
      {/* Body Section */}
      <div className="flex flex-col p-6 flex-1 bg-white">
        <h3 className="font-bold text-[#2D3142] text-[20px] line-clamp-2 title-min-h leading-[1.4] mb-1 group-hover:text-[#D94A56] transition-colors">
          {title}
        </h3>
        {subtitle && <p className="text-sm text-gray-500 line-clamp-1 mb-1">{subtitle}</p>}
        {attempts !== undefined && <p className="text-[14px] text-gray-500 font-medium">{attempts} attempts</p>}
        
        {/* Legacy Meta Component */}
        {(author || views !== undefined) && (
          <div className="flex items-center justify-between gap-2 mt-auto pt-4">
            {author && (
              <div className="flex items-center gap-2">
                {authorAvatar && <img src={authorAvatar} alt={author} className="w-5 h-5 rounded-full object-cover" />}
                <span className="text-xs text-gray-500 font-medium">{author}</span>
              </div>
            )}
            {views !== undefined && (
              <span className="text-xs text-gray-400 font-medium">👁 {formatViews(views)}</span>
            )}
          </div>
        )}

        {/* Action Row */}
        {(actionText || score !== undefined) && (
          <div className="flex items-center justify-between mt-[24px]">
            {actionText && (
               <div className="flex items-center gap-[6px] border border-gray-200 rounded-[30px] px-5 py-2 group-hover/btn:border-[#D94A56] hover:bg-[#FFF5F5] transition-all duration-300 group/btn">
                 {actionText.toLowerCase().includes('thử lại') ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#D94A56] flex-shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                 ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#D94A56] flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="2"/>
                      <path d="M10.5 8.5L15.5 12L10.5 15.5V8.5Z" fill="currentColor"/>
                    </svg>
                 )}
                 <span className="font-bold text-[#2D3142] text-[15px] group-hover/btn:text-[#D94A56] transition-colors">{actionText}</span>
               </div>
            )}
            
            {score !== undefined && (
               <div className="flex items-center justify-center w-[52px] h-[52px] rounded-full border border-gray-200 text-[#D94A56] font-bold text-[18px] group-hover:border-[#D94A56] group-hover:bg-[#FFF5F5] transition-colors duration-300">
                 {score}
               </div>
            )}
          </div>
        )}
      </div>
    </Tag>
  );
};
