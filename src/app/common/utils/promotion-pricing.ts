import { PromotionResponse } from '../models/promotion.model';

export interface PromotionalPriceInfo {
    hasPromotion: boolean;
    originalPrice: number;
    effectivePrice: number;
    promotionName?: string;
}

/**
 * Tính giá hiệu lực (sau khuyến mãi) cho 1 món dựa trên danh sách promotion đang ACTIVE.
 * Chỉ mang tính hiển thị — giá thật do backend tính lại khi tạo đơn (đây là bên phải khớp logic đó).
 */
export function getPromotionalPrice(
    storeFoodId: number,
    originalPrice: number,
    activePromotions: PromotionResponse[]
): PromotionalPriceInfo {
    for (const promo of activePromotions) {
        if (promo.promotionType === 'FIXED_PRICE') {
            const item = promo.fixedPriceItems.find(i => i.storeFoodId === storeFoodId);

            if (item) {
                return {
                    hasPromotion: true,
                    originalPrice,
                    effectivePrice: item.fixedPrice,
                    promotionName: promo.name
                };
            }
        } else if (promo.promotionType === 'PRODUCT_DISCOUNT') {
            const item = promo.discountItems.find(i => i.storeFoodId === storeFoodId);

            if (item) {
                let effectivePrice: number;

                if (item.discountType === 'PERCENT') {
                    let discountAmount = (originalPrice * item.discountValue) / 100;

                    if (item.maxDiscountAmount) {
                        discountAmount = Math.min(discountAmount, item.maxDiscountAmount);
                    }

                    effectivePrice = Math.max(originalPrice - discountAmount, 0);
                } else {
                    effectivePrice = Math.max(originalPrice - item.discountValue, 0);
                }

                return {
                    hasPromotion: true,
                    originalPrice,
                    effectivePrice,
                    promotionName: promo.name
                };
            }
        }
    }

    return {
        hasPromotion: false,
        originalPrice,
        effectivePrice: originalPrice
    };
}

/** Các chương trình "Mua X tặng Y" mà giỏ hàng hiện tại đã đủ điều kiện nhận quà. */
export function getEligibleGiftPromotions(
    activePromotions: PromotionResponse[],
    subtotal: number,
    totalQuantity: number
): PromotionResponse[] {
    return activePromotions.filter(promo => {
        if (promo.promotionType !== 'BUY_X_GET_Y') {
            return false;
        }

        if (promo.conditionType === 'MIN_ORDER_AMOUNT') {
            return subtotal >= (promo.conditionMinAmount ?? Number.POSITIVE_INFINITY);
        }

        if (promo.conditionType === 'MIN_QUANTITY') {
            return totalQuantity >= (promo.conditionMinQuantity ?? Number.POSITIVE_INFINITY);
        }

        return false;
    });
}
