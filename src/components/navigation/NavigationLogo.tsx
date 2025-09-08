
import { useNavigate } from 'react-router-dom';

const NavigationLogo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-8 flex items-center justify-center cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img 
          src="/lovable-uploads/8fe769f4-bcea-4c20-ab31-dbe6174dc510.png" 
          alt="3MG Logo" 
          className="w-10 h-8 object-contain brightness-0 invert"
        />
      </div>
      <span 
        className="font-bold text-lg text-foreground font-orbitron cursor-pointer hover:text-primary transition-colors"
        onClick={() => navigate('/dashboard')}
      >
        3MGODINI
      </span>
    </div>
  );
};

export default NavigationLogo;
