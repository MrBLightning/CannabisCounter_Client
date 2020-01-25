export interface Product {
    barCode: number;//7290000162829,
    name: string;//"מיקספלקס אגוזים 400",
    GroupId?: number;// 115,
    SubGroupId?: number;// 1060,
    DegemId?: number;// 828,
    hasimg?: number;// 1,
    group1?: string;
    degem1?: string;

    flag3?: number;  // 0,
    flaghag?: number;  // 0,
    flagmiv?: number;  // 0,

    ariza?: number;  // 7,
    lastyitra?: number;  // 17, // יתרת מלאי
    yitraMlayCalInAspaka?: number;  // יתרת מלאי
    amountOrder?: number;  // --------
    amountOrder1?: number;   // המלצה להזמנה
    sumofday?: number;   // ------
    averageDay?: number;  // צפי מכירות
    averageDaySum?: number;  // צפי מיכורת
    amountToOrder?: number;  // הכנסת משתמש מס הזמנות
    completionToSumMin?: number;  // -15,
    ord?: Product[];
}