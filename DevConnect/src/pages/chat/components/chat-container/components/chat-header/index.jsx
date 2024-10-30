import { RiCloseFill } from 'react-icons/ri';
import { useAppStore } from '../../../../../../store';

const ChatHeader = () => {
  const { closedChat } = useAppStore();
  
  return (
    <div className="h-[8vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className='flex gap-5 items-center'>
        <div className="flex gap-3 items-center justify-center">
  
        </div>

        <div className="flex items-center justify-center gap-5">
          <button 
          onClick={closedChat}
          className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'>
            <RiCloseFill size={25}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;