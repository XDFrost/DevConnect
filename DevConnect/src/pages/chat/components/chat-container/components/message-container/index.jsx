import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useAppStore } from "../../../../../../store";
import { apiClient } from "../../../../../../lib/api-client";
import { GET_ALL_MESSAGES_ROUTE, HOST } from "../../../../../../../utils/constants";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import "./index.css"
import { IoClose } from "react-icons/io5";

const MessageContainer = () => {
  const scrollRef = useRef();
  const { selectedChatType, selectedChatData, selectedChatMessages, setSelectedChatMessages, directMessagesContacts, setDirectMessagesContacts, setFileDownloadProgress, setIsDownloading } = useAppStore();
  
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  
  // console.log(selectedChatData);
  // console.log(directMessagesContacts);

  const removeFromContactListIfNoMessages = (contactId) => {
    const updatedContacts = directMessagesContacts.filter(contact => contact._id !== contactId);
    setDirectMessagesContacts(updatedContacts);
  }

  const addIfNotInContactList = (contact) => {
    const contactExists = directMessagesContacts.find(c => c._id === contact._id);
    if(!contactExists) {
      setDirectMessagesContacts([...directMessagesContacts, contact]);
    }
  }

  useEffect(()=> {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE,
        {id: selectedChatData.contact._id},
        {withCredentials: true});

        if(response.data.messages) {
          (response.data.messages.length === 0) 
          ? removeFromContactListIfNoMessages(selectedChatData.contact._id) 
          : addIfNotInContactList(selectedChatData.contact);
          
          setSelectedChatMessages(response.data.messages);
        }
      }
      catch (err) {
        console.log(err);
      }
    };

    if(selectedChatData.contact._id) {
      if(selectedChatType === "contact") {
        getMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages, addIfNotInContactList, removeFromContactListIfNoMessages]);

  useEffect(() => {
    if(scrollRef.current) {
      scrollRef.current.scrollIntoView({behaviour: "smooth"});
    }
  }, [selectedChatMessages])

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {
            selectedChatType === "contact" && renderDMMessage(message)
          }
        </div>
      )
    });
  };

  const checkIfImage = (filepath) => {
    const imageRegex = /\.(jpeg|jpg|gif|png|heic|ico|webp|svg)$/i;
    return imageRegex.test(filepath);
  };

  const downloadFile = async (url) => {
    
    setIsDownloading(true);
    setFileDownloadProgress(0);

    const response = apiClient.get(`${HOST}/${url}`, 
      { responseType: "blob",
          onDownloadProgress: (progressEvent) => {
          const {loaded, total} = progressEvent;
          const percentCompeleted = Math.round((loaded * 100) / total);
          setFileDownloadProgress(percentCompeleted);
        }
      },
    );   // responseType: "blob" is used to download the file
    
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));    // Create a URL for the blob
    const link = document.createElement("a");   // Create a link element
    link.href = urlBlob;    // Set the href of the link
    link.setAttribute("download", url.split("/").pop());   // Set the download attribute
    document.body.appendChild(link);    // Append the link to the body
    link.click();     // Click the link
    link.remove();    // Remove the link
    window.URL.revokeObjectURL(urlBlob);    // Revoke the object URL
    setIsDownloading(false);
    setFileDownloadProgress(0);
  };

  const renderDMMessage = (message) => (
    <div className={`${message.sender === selectedChatData.contact._id ? "text-left" : "text-right"}`}>
      {message.messageType === "text" && (
        <div 
        className={`${message.sender !== selectedChatData.contact._id 
                  ? "bg-[#8417ff]/5 text-[#ffffff]/90 border-[#8417ff]/50" 
                  : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block rounded p-4 my-1 max-w-[50%] break-words`}
                  style={{whiteSpace: "pre-wrap"}}
        >
        {message.content}
      </div>)}

      {message.messageType === "file" && (
        <div 
          className={`${message.sender !== selectedChatData.contact._id 
                    ? "bg-[#8417ff]/5 text-[#ffffff]/90 border-[#8417ff]/50" 
                    : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"} border inline-block rounded p-4 my-1 max-w-[50%] break-words`}
                    style={{whiteSpace: "pre-wrap"}}
          >
          {checkIfImage(message.fileUrl) 
          ? <div onClick = { () => {
              setShowImage(true);
              setImageURL(`${message.fileUrl}`);
            }}
              className="cursor-pointer">
              <img src = {`${HOST}/${message.fileUrl}`} height={300} width={300}/>
            </div> 
          : <div className="flex items-center justify-center gap-5">
              <span className="text-white/18 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip/>
              </span>
              <span className="hidden sm:inline">
                {message.fileUrl.split("/").pop()} 
              </span>
              <span onClick={() => downloadFile(message.fileUrl)} 
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300">
                <IoMdArrowRoundDown/>
              </span>
            </div>}
        </div>
      )}

      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-scroll scrollbar-hidden-track p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollRef}/>
      {
        showImage && <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img 
              src={`${HOST}/${imageURL}`}
              className="h-[80vh] w-full bg-cover"
            />
          </div>
          
          <div className="flex gap-5 fixed top-0 mt-5">

            <button onClick={() => downloadFile(imageURL)} 
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300">
              <IoMdArrowRoundDown/>
            </button>

            <button onClick={() => {
              setShowImage(false);
              setImageURL(null);
            }} 
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300">
              <IoClose/>
            </button>

          </div>
        </div>
      }
    </div>
  );
};

export default MessageContainer;