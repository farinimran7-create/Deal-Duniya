import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ThumbsUp, ThumbsDown, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { type CouponResponse } from "@shared/routes";
import { useVoteCoupon, useValidateCoupon } from "@/hooks/use-coupons";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CouponCardProps {
  coupon: CouponResponse;
}

export function CouponCard({ coupon }: CouponCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const voteMutation = useVoteCoupon();
  const validateMutation = useValidateCoupon();

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    
    // Open affiliate link in new tab
    if (coupon.affiliateLink) {
      window.open(coupon.affiliateLink, '_blank');
    }
  };

  const handleValidate = () => {
    setShowAnalysis(true);
    validateMutation.mutate(coupon.id);
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-200 text-gray-600";
    if (score >= 70) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 40) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getScoreBarColor = (score: number | null) => {
    if (!score) return "bg-gray-300";
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="coupon-card group flex flex-col h-full"
    >
      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Brand & Score */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm border p-1 flex items-center justify-center overflow-hidden">
              {coupon.brand?.logoUrl ? (
                <img src={coupon.brand.logoUrl} alt={coupon.brand.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xl font-bold text-primary">{coupon.brand?.name?.[0]}</span>
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg leading-tight">{coupon.title}</h3>
              <p className="text-sm text-muted-foreground">{coupon.brand?.name}</p>
            </div>
          </div>
          
          <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5", getScoreColor(coupon.successScore))}>
            <div className="flex gap-0.5">
              {[1, 2, 3].map((bar) => (
                <div 
                  key={bar} 
                  className={cn("w-1 h-3 rounded-full", getScoreBarColor(coupon.successScore))}
                  style={{ opacity: (coupon.successScore || 0) > (bar * 25) ? 1 : 0.3 }}
                />
              ))}
            </div>
            <span>{coupon.successScore || 0}% Success</span>
          </div>
        </div>

        {/* Discount & Desc */}
        <div className="mb-6 flex-1">
          <div className="text-2xl font-bold text-primary mb-1">{coupon.discountAmount}</div>
          <p className="text-muted-foreground text-sm line-clamp-2">{coupon.description}</p>
        </div>

        {/* Coupon Code Action */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl -z-10" />
          <div className="flex items-center justify-between p-1 pr-1 border border-dashed border-primary/30 rounded-xl bg-white/50 backdrop-blur-sm">
            <code className="px-4 py-2 font-mono font-bold text-lg text-primary tracking-wider">
              {coupon.code}
            </code>
            <button
              onClick={handleCopy}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2",
                isCopied 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              )}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Analysis Toggle */}
        <button 
          onClick={handleValidate}
          className="w-full text-xs font-medium text-secondary hover:text-secondary/80 flex items-center justify-center gap-1 mb-4 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          {showAnalysis ? "Refresh AI Analysis" : "Show AI Success Prediction"}
        </button>

        {/* Analysis Result */}
        <AnimatePresence>
          {showAnalysis && validateMutation.data && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 mb-4 border border-slate-100"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">Confidence: {validateMutation.data.confidence}</span>
                <span className="text-slate-400">Just now</span>
              </div>
              <p>{validateMutation.data.analysis}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t mt-auto">
          <div className="text-xs text-muted-foreground">
            {coupon.lastVerified ? `Verified ${formatDistanceToNow(new Date(coupon.lastVerified))} ago` : "Recently added"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Worked?</span>
            <button 
              onClick={() => voteMutation.mutate({ id: coupon.id, worked: true })}
              disabled={voteMutation.isPending}
              className="p-1.5 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded-full transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button 
              onClick={() => voteMutation.mutate({ id: coupon.id, worked: false })}
              disabled={voteMutation.isPending}
              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
