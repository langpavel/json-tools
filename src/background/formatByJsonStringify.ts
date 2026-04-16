export const formatByJsonStringify = async (text: string) => {
  const parsed = JSON.parse(text);
  return { output: JSON.stringify(parsed, null, 2) };
};
