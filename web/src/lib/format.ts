const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const amount = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('pt-BR');

export const formatPrice = (value: number) => currency.format(value);

/** Valor sem o símbolo, para quando o "R$" recebe tratamento próprio. */
export const formatAmount = (value: number) => amount.format(value);

export const formatCount = (value: number) => integer.format(value);

export const pluralize = (count: number, singular: string, plural: string) =>
  `${formatCount(count)} ${count === 1 ? singular : plural}`;

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
