export interface AdminContentText {
  pages: PageContentText[];
  shared: SharedContentText,
  adaptListView: AdaptListViewContentText
}

export interface SharedContentText{
  multiSelect: MultiSelectContentText,
  impactAnalysis: ImpactAnalysisContentText,
  languageAccess: LanguageAccessContentText,
  createUpdate: CreateUpdateContentText
}

export interface CreateUpdateContentText{
  lastUpdated: string,
  createdBy: string
}

export interface LanguageAccessContentText{
  supportedLanguages: SupportedLanguageOption[]
}
export interface SupportedLanguageOption {
  label: string;
  localizedLabel: string;
  value: string;
}

export interface ImpactAnalysisContentText{
  reportName: string
  dataSourceCountTemplate: string
  dataViewCountTemplate: string
  glossaryCountTemplate: string
  title: string
  status: string
  learnMore: string
  audience: string
  noDataViews: string
  noReports: string
}

export interface MultiSelectContentText{
  select_all: string,
  expand: string,
  collapse: string,
  selected_template: string
}

export interface PageContentText {
  name?: string;
  title?: string;
  description?: string;
  learn_more_link?: string;  //"Learn More",
  sections?: PageSectionContentText[];
  tabs?: string[];
  loginContent?: loginContentText;
  actions?: ActionContentText;
}

export interface loginContentText {
  metaTitle: string;
  metaDescription: string;
  title: string;
  subtitle: string;
  emailLabel: string;
  emailHint: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  passwordHint: string;
  rememberMeLabel: string;
  loginButtonLabel: string;
  ssoLabel: string;
  microsoftLabel: string;
}

export interface PageSectionContentText {
disclaimer: any;
additional_info: any;
  title: string; // page header
  name: string; // tab name
  header: string;
  options: any[];
  description: string;

  instructions?: string;
  sub_sections?: PageSectionColumnContentText[];
  questions?: SectionQuestionContentText[];
  messages?: MessagesContentText;
  actions?: ActionContentText;
}

export interface PageSectionColumnContentText {
  title: string;
  description: string;
  //instructions?: string;
  path?: string;
  items: string[];
  actions?: ActionContentText;
}

export interface SectionQuestionContentText {
  label: string;
  placeholder?: string;
  type: string;
  comment?: string;
  required: boolean;
  selected_option?: string;
  validation_messages?: MessagesContentText;
  options: QuestionOptionContentText[];
  id?: string
}

export interface QuestionOptionContentText {
  label: string;
  localizedLabel: string;
  value: string;
  selected?: boolean;
}

export interface MessagesContentText {
  [name: string]: SectionMessage;
}

export interface SectionMessage {
  //type: string;
  message: string;
  details?: string;
}

export interface ActionContentText {
  [name: string]: string;
}

export interface  AdaptListViewContentText {
  actions: string[];
}

export interface DataRepComparisonControlsText {
  title: string;
  description: string;
  compareButtonLabel: string;
  cancelButtonLabel: string;
  triggerButtonLabel: string;
  comparison1Label: string;
  comparison2Label: string;
  validationMessages?: { [name: string]: string;}
}
