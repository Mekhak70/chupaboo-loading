
// Երևանի թաղամասեր (բոլոր տարբերակներով)
const YEREVAN_DISTRICTS = [
    'քենտրոն', 'կենտրոն', 'centr', 'center',
    'արաբկիր', 'arabkir',
    'աջափնյակ', 'arajnyak', 'ajapnyak',
    'ավան', 'avan',
    'դավթաշեն', 'davtashen',
    'էրեբունի', 'erebuni',
    'քանաքեռ', 'kanaker',
    'մալաթիա', 'malatia', 'sebastia', 'սեբաստիա',
    'նորք', 'nork',
    'նոր նորք', 'nor nork',
    'շենգավիթ', 'shengavit',
    'զեյթուն', 'zeitun'
]

// Երևանի փողոցների վերջավորություններ
const STREET_SUFFIXES = ['փողոց', 'պողոտա', 'նրբանցք', 'ծառուղի', 'խճուղի', 'street', 'avenue', 'lane']

// Երևանի հասցեների pattern-ներ
const YEREVAN_PATTERNS = [
    /(^|\s)(երևան|yerevan|erevan)(\s|$)/i,
    /ք\.\s*(երևան|yerevan)/i,
    /c\.\s*yerevan/i,
    /քաղաք\s*երևան/i,
    /city\s*of\s*yerevan/i
]

// Երևանի փոստային ինդեքսների միջակայք (0001-0099)
function hasYerevanPostalCode(address: string): boolean {
    const zipMatch = address.toLowerCase().match(/\b(00[0-9]{2})\b/)
    if (zipMatch) {
        const zipCode = parseInt(zipMatch[1])
        return zipCode >= 1 && zipCode <= 99
    }
    return false
}

// Ստուգել թաղամասի անվանում (ներառյալ հոլովները)
function hasYerevanDistrict(address: string): boolean {
    const normalized = address.toLowerCase()
    
    for (const district of YEREVAN_DISTRICTS) {
        // Ուղիղ համընկում
        if (normalized.includes(district)) return true
        
        // Հայերեն հոլովներ
        const variants = [
            district,
            district + 'ում',
            district + 'ի',
            district + 'ից',
            district + 'ով',
            district.slice(0, -1) + 'ի',
            district.slice(0, -1) + 'ում'
        ]
        
        for (const variant of variants) {
            if (normalized.includes(variant)) return true
        }
    }
    
    return false
}

// Ստուգել արդյոք հասցեն Երևանում է
export function isAddressInYerevan(address: string): boolean {
    if (!address || address.trim().length < 5) return false
    
    const normalized = address.toLowerCase().trim()
    
    // 1. Ստուգել Երևանի ուղիղ նշում
    for (const pattern of YEREVAN_PATTERNS) {
        if (pattern.test(normalized)) return true
    }
    
    // 2. Ստուգել փոստային ինդեքս
    if (hasYerevanPostalCode(normalized)) return true
    
    // 3. Ստուգել թաղամասերի անվանումներ
    if (hasYerevanDistrict(normalized)) return true
    
    // 4. Եթե հասցեն սկսվում է փողոցի անունով և ավարտվում "երևան"-ով
    const hasStreetSuffix = STREET_SUFFIXES.some(suffix => normalized.includes(suffix))
    const endsWithYerevan = /երևան$|yerevan$/.test(normalized)
    
    if (hasStreetSuffix && endsWithYerevan) return true
    
    // 5. Եթե հասցեն պարունակում է "ք" (քաղաք) և "երևան"
    if (normalized.includes('ք') && (normalized.includes('երևան') || normalized.includes('yerevan'))) {
        return true
    }
    
    return false
}

// Հաշվել առաքման վճարը՝ հիմնվելով հասցեի և գումարի վրա
export function calculateDeliveryFee(
    address: string,
    productTotal: number,
    deliveryOption: 'delivery' | 'pickup',
    freeDeliveryThreshold: number,
    baseDeliveryFee: number,
    outOfYerevanFee: number = 1500
): { fee: number; isInYerevan: boolean } {
    // Pickup - no delivery fee
    if (deliveryOption === 'pickup') {
        return { fee: 0, isInYerevan: false }
    }
    
    // No address provided
    if (!address || address.trim().length < 5) {
        return { fee: 0, isInYerevan: false }
    }
    
    const isInYerevan = isAddressInYerevan(address)
    
    // Not in Yerevan - charge out of city fee
    if (!isInYerevan) {
        return { fee: outOfYerevanFee, isInYerevan: false }
    }
    
    // In Yerevan - free if total >= threshold
    if (productTotal >= freeDeliveryThreshold) {
        return { fee: 0, isInYerevan: true }
    }
    
    // In Yerevan but total < threshold
    return { fee: baseDeliveryFee, isInYerevan: true }
}