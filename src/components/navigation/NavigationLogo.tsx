
import { useNavigate } from 'react-router-dom';

const NavigationLogo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img 
          src="/lovable-uploads/924af0ae-dd6b-494b-a23c-37583952b3e8.png" 
          alt="3MGODINI Logo" 
          className="w-8 h-8 object-contain"
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
