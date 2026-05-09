import { IMAGE_CONFIG } from '../constants';
import './QuantityInput.css';

interface QuantityInputProps {
  /** Valor atual do input */
  value: number;
  /** Callback para mudança de valor */
  onChange: (value: number) => void;
  /** Callback para quando o input perde o foco */
  onBlur?: () => void;
  /** Classes CSS adicionais */
  className?: string;
  /** Estilos inline adicionais */
  style?: React.CSSProperties;
  /** Valor mínimo permitido */
  min?: number;
}

/**
 * Componente de input numérico para quantidade
 * Remove os spinners padrão do navegador
 */
const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  onBlur,
  className = '',
  style = {},
  min = IMAGE_CONFIG.MIN_QUANTITY,
}) => {
  /**
   * Processa a mudança de valor do input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputValue = e.target.value;
    
    // Permite campo vazio temporariamente (usuário pode estar digitando)
    if (inputValue === '') {
      onChange(0);
      return;
    }

    const numericValue = parseInt(inputValue, 10);
    
    // Valida se é um número válido
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  return (
    <input
      type="number"
      min={min}
      value={value === 0 ? '' : value}
      onChange={handleChange}
      onBlur={onBlur}
      className={`${className} no-spinner`.trim()}
      style={style}
      aria-label="Quantidade"
    />
  );
};

export default QuantityInput;
