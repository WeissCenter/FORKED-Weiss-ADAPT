export interface ViewerContentText {
  pages: {
    home: HomePageContentText | null;
    resources: ResourcePageContentText | null;
    report: ReportPageContentText | null;
    reports: ReportsPageContentText | null;
    error: ErrorPageContentText | null;
  };
  shared: SharedContentText;
}

export interface ReportsPageContentText {
  header: string;
  body: string;
  loading: string;
  loaded: string;
  sortApplied: string;
  filterApplied: string;
}

export interface ReportPageContentText {
  suppressionWarning: {
    heading: string;
    description: string;
  };
  quickSummary: {
    header: string;
  };
  filterPopup: {
    header: string;
    description: string;
  };
  dataRepModal: {
    description: string;
  };
  actions: {
share: any;
    close_button: string;
    explain: string;
    glossary: string;
    success: string;
    percent: string;
    download_csv: string;
    download_excel: string;
    value_label: string;
    filter: string;
    note: string;
    section_unavailable: string;
    of: string;
    verified: string;
    selected: string;
    filter_description: string;
    filter_controls_description: string;
    apply_and_close: string;
    reset: string;
    cancel: string;
    open_filter_panel: string;
    reset_all_filters: string;
    plain_language_summary: string;
    data: string;
    preset_hint: string;
    filter_groups: string;
    suppressed: string;
    filtered: string;
    close: string;
    total_label: string;
  };
}

export interface HomePageContentText {
  brandingHeader: {
    heading: string,
    subHeading: string
  };
  headingCard: {
    heading: string;
    body: string;
  };
  latestReports: {
    title: string;
    description: string;
    button_text: string;
    viewButton: string;
    shareButton: string;
    dataButton: string;
  };
}

export interface ErrorPageContentText {
  header: string;
  description: string;
  return: string;
}

export interface ResourcePageContentText {
  heading: HeaderContent;
  secondaryNavigation: SecondaryNavigationContent;
  usefulLinks: HeaderLinkListContent;
  frequentlyAskedQuestions: FrequentlyAskedQuestionContent;
}

export interface LanguageContentText {
  newWindow: string;
  selectorTitle: string;
  selectorDescription: string;
  selectorClose: string;
  supportedLanguages: { langLabel: string; translatedLabel: string; langCode: string }[];
}

export interface AccessibilityContentText {
  newWindow: string;
  language: LanguageContentText;
}

export interface SharedContentText {
  paginator: PaginatorContentText;
  listControls: ListControlsContentText;
  frequentlyAskedQuestions: SectionContentText;
  accessibility: AccessibilityContentText;
  sidebar: SidebarContentText;
  footer: FooterContentText;
  breadcrumb: BreadcrumbContentText;
  a11yCenterContent: A11yCenterContent;
}

export interface PaginatorContentText {
  showingUpTo: string;
  of: string;
  items: string;
}

export interface ListControlsContentText {
  sort: string;
}

export interface FooterContentText {
  technologyBy: string;
}

export interface BreadcrumbContentText {
  home: string;
  resources: string;
  report: string;
}
export interface SidebarContentText {
  open: string;
  menu: string;
  collapse: string;
  openMenu: string;
  resources: string;
  reports: string;
  home: string;
  languageAccess: string;
  accessibility: string;
}

export interface FrequentlyAskedQuestionContent {
  headingSectionLabel: string;
  listSectionLabel: string;
  description: string;
}

export interface SectionContentText {
  title: string;
  description: string;
  button_text: string;
  footNote: string;
  tableHeading: string,
  listAria: string;
  categories: CategoryContentText[];
}

export interface CategoryContentText {
  name: string;
  fragment?: string;
  questions: QuestionContentText[];
}

export interface QuestionContentText {
  categoryName?: string;
  addToLanding?: boolean;
  question: string;
  answer: string;
}

export interface HeaderContent {
  header: string;
  sectionLabel: boolean;
  description: string;
}

export interface SecondaryNavigationContent {
  links: LinkContent[];
}

export interface HeaderLinkListContent {
  header: string;
  headerSectionLabel: string;
  listSectionLabel: string;
  description: string;
  links: LinkContent[];
}

export interface LinkContent {
  name: string;
  description?: string;
  link?: string;
  queryParams?: {
    navigation: string;
  }; 
}

export interface A11yCenterContent {
  title: string;
  description: string;
  closeLabel: string;
  resetAllLabel: string;
  resetStatusMessage: string;
  fontSizeTitle: string;
  fontSizeDescription: string;
  fontSizeOptionDefault: string;
  fontSizeOptionSmaller: string;
  fontSizeOptionLarge: string;
  fontSizeOptionLarger: string;
  fontSizeOptionLargest: string;
  themeTitle: string;
  themeDescription: string;
  themeOptionDefault: string;
  themeOptionDynamicDark: string;
  themeOptionHighContrast: string;
  spacingTitle: string;
  spacingDescription: string;
  spacingOptionDefault: string;
  spacingOptionCompact: string;
  spacingOptionComfort: string;
  spacingOptionExtraComfort: string;
  layoutTitle: string;
  layoutDescription: string;
  layoutOptionDefault: string;
  layoutOptionMobile: string;
}
