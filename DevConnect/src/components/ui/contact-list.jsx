/* eslint-disable react/prop-types */
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useAppStore } from "../../store"
import { HOST } from "../../../utils/constants";
import { getColor } from "../../lib/utils";

const ContactList = ({ contacts, isChannel = false }) => {
  const { selectedChatData, setSelectedChatData, setSelectedChatType, setSelectedChatMessages } = useAppStore();

  // console.log(selectedChatData);

  const handleClick = (contact) => {
    // isChannel ? setSelectedChatType("channel") : setSelectedChatType("contact");
    if(isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");

    setSelectedChatData({contact: contact});

    if(selectedChatData && selectedChatData.contact._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  }; 

  return (
    <div className="mt-1">
      {contacts.map((contact) => (
        <div 
        key = {contact._id} 
        className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${selectedChatData && selectedChatData.contact._id === contact._id 
        ? "bg-[#2a2c38] hover:bg-[#f1f1f111]" 
        : "hover:bg-[#f1f1f111]"}`}
        onClick={() => handleClick(contact)}>

          <div className="flex gap-5 items-center justify-start text-neutral-300">
            {
              !isChannel && (
                <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                {
                  contact.image ? ( 
                  <AvatarImage src = {`${HOST}/${contact.image}`} 
                  alt = "profile" 
                  className="object-cover w-full h-full bg-black rounded-full"/> )
                  : ( <div className={`${selectedChatData && selectedChatData.contact._id === contact._id 
                  ? "bg-[#ffffff22] border border-white/70" 
                  : getColor(contact.color)}
                  uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                  contact.color
                  )}`}>
                    {contact.firstName 
                    ? contact.firstName.split("").shift()
                    : contact.email.split("").shift()}
                  </div>
              )}
              </Avatar>
            )}
            {
              isChannel && <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full"> # </div>
            }
            {
              isChannel ? <span className="font-bold">{contact.name}</span> : <span className="font-medium text-lg">{`${contact.firstName} ${contact.lastName}`}</span>
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList