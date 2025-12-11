import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearMessage } from '../redux/authslice';

const Message = () => {
  const message = useSelector((state) => state.auth.message);
  const dispatch = useDispatch();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => dispatch(clearMessage()), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px 20px',
        backgroundColor: message.type === 'success' ? '#4caf50' : '#f44336',
        color: 'white',
        borderRadius: '5px',
        zIndex: 1000,
      }}
    >
      {message.text}
    </div>
  );
};

export default Message;