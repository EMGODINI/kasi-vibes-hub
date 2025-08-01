
import { useNavigate } from 'react-router-dom';

const NavigationLogo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-8 flex items-center justify-center cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img 
          src="/3mg-logo.png" 
          alt="3MG Logo" 
          className="w-10 h-8 object-contain"
        />
      </div>
      <span 
        className="font-bold text-lg bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent font-orbitron cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        3MGODINI
      </span>
    </div>
  );
};

export default NavigationLogo;
