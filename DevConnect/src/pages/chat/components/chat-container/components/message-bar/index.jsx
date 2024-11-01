import { useEffect, useRef, useState } from "react";
import { GrAttachment } from 'react-icons/gr'
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useAppStore } from "../../../../../../store";
import { useSocket } from "../../../../../../context/SocketContext";

const MessageBar = () => {
  const emojiRef = useRef();
  const EnterRef = useRef(null);
  const inputRef = useRef(null);
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { selectedChatType, selectedChatData, userInfo} = useAppStore();
  
  useEffect(() => {
    // Focus on the input field when the component mounts
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiRef]);

  const handleSendMessage = async () => {
    if(selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message, 
        recipient: selectedChatData.contact._id,
        messageType: "text",
        fileUrl: undefined,
      });
    }
    setMessage("");
  };

  const handleAddEmoji = (emoji) => {
    setMessage(message + emoji.emoji);
    inputRef.current.focus();
  };

  const handleEnterPress = (e) => {
    if(e.key === 'Enter') {
      e.preventDefault();
      // if(message.trim() === "") return;\
      if(message !== "") {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="h-[7vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-5 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input type="text" 
        placeholder="Enter Message"
        className="flex-1 p-4 bg-transparent rounded-md focus:border-none focus:outline-none"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        ref={inputRef}
        onKeyDown={handleEnterPress}
        />

        <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white hover:text-white duration-300 transition-all'>
          <GrAttachment size={20}/>
        </button>

        <div className="relative">
          <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white hover:text-white duration-300 transition-all'
          onClick={() => setEmojiPickerOpen(true)}>
            <RiEmojiStickerLine size={24} className="mt-[5px]"/>
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker 
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      
      <button className={`bg-[#8417ff] rounded-md flex items-center justify-center p-4 focus:border-none hover:bg-[#741bda] focus:bg-[#6917c8] focus:outline-none focus:text-white duration-300 transition-all ${message.trim() === "" ? "cursor-not-allowed bg-[#45167a] hover:bg-[#45167a] focus:bg-[#45167a]" : "cursor-pointer"}`}
      disabled={message.trim() === ""}
      onClick={handleSendMessage}
      ref={EnterRef}>
        <IoSend size={20}/>
      </button>
    
    </div>
  );
};

export default MessageBar;