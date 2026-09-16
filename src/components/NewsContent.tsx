type Props = {
  html: string;
};

export function NewsContent({ html }: Props) {
  return (
    <div
      className="news-content mt-8 max-w-none text-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
