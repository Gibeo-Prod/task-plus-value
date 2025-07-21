import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();

  const goBack = () => {
    // Tenta voltar na história do navegador
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Se não há história, vai para a página inicial
      navigate('/');
    }
  };

  const goToPage = (path: string) => {
    navigate(path);
  };

  const goForward = () => {
    window.history.forward();
  };

  return {
    goBack,
    goToPage,
    goForward,
    navigate
  };
};