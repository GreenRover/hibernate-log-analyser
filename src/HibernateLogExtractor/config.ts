export class HibernateLogExtractorConfig {
    public sqlComment: boolean = false;
    public hql: boolean = false;
    public statistic: boolean = false;

    public extractDate: boolean = false;
    public dateRegex: string = "(\\d{4}\-\\d{2}\-\\d{2} \\d{2}\\:\\d{2}\\:\\d{2}\\,\\d{3})";
}