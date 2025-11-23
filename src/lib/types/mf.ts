export interface SchemeListItem {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string | null;
  isinDivReinvestment: string | null;
}

export interface SchemeNav {
  date: string;
  nav: string;
}

export interface Scheme {
  meta: SchemeMeta
  data: SchemeNav[];
  status: string;
}

export interface SchemeMeta {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
    isin_growth: string;
    isin_div_reinvestment: string | null;
  }
