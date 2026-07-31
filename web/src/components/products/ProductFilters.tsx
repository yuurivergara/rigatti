import { Select, TextInput } from '../ui/Field';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
};

export function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
}: Props) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <TextInput
        className="min-w-56 flex-1"
        placeholder="Buscar por nome, descrição ou categoria"
        aria-label="Buscar produtos"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Select
        className="w-auto"
        aria-label="Filtrar por categoria"
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <option value="">Todas as categorias</option>
        {categories.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
    </div>
  );
}
