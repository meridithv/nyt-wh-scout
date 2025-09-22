export function statusTag(weeksOn: number, lastWeek: number, thisWeek: number) {
  if (lastWeek === 0) return "NEW THIS WEEK";
  if (thisWeek < lastWeek) return `UP FROM #${lastWeek} LAST WEEK`;
  if (thisWeek > lastWeek) return `DOWN FROM #${lastWeek} LAST WEEK`;
  return `${weeksOn} WEEKS ON LIST`;
}

export function line(
  author: string,
  title: string,
  rank: number,
  category: string,
  tag: string
) {
  return `${author}, ${title.toUpperCase()}, #${rank} - ${category} (${tag})`;
}
