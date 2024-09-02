import React, { useState, useRef } from "react";
import { BsSend } from "react-icons/bs";
import { MdMic } from "react-icons/md";
import { BsPauseCircleFill } from "react-icons/bs";
import { IoMdPlayCircle } from "react-icons/io";

function App() {
  const [recordings, setRecordings] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setRecordings((prevRecordings) => [...prevRecordings, audioUrl]);
      clearInterval(timerRef.current as NodeJS.Timeout);
    };

    mediaRecorderRef.current.start();
    startTimer();
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    mediaRecorderRef.current?.stop();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current?.pause();
      setIsPaused(true);
      clearInterval(timerRef.current as NodeJS.Timeout);
    }
  };

  const continueRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current?.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const deleteRecording = () => {
    setRecordings([]);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <main className='flex justify-center items-center w-full h-screen bg-[url("./bg.jpg")] bg-center bg-cover bg-no-repeat flex-col'>
      <h1 className="text-[#554d4d] text-[17px] bg-[white] px-[20px] py-[5px] mb-[5px] rounded-[5px] font-bold">
        Audio Recorder
      </h1>
      <div className="w-[380px] h-[450px] border-[2px] border-solid border-[white] rounded-[15px] bg-[#ffffff4a] overflow-hidden">
        <div className="w-full h-[380px] overflow-y-scroll p-[15px] flex justify-start items-end flex-col gap-[20px]">
          <div className="w-full flex justify-between items-center">
            <button
              onClick={() => {
                deleteRecording();
              }}
              className="bg-[tomato] text-[white] text-sm px-[17px] py-[5px] rounded-[5px]"
            >
              Clear All
            </button>
            <h3 className="text-sm bg-[white] px-[10px] py-[5px] rounded-[5px]">
              Recorded Audios:
            </h3>
          </div>
          <ul className="flex justify-end items-center flex-col gap-[10px]">
            {recordings.map((audioUrl, index) => (
              <li
                key={index}
                className="flex justify-center items-start bg-[white] p-[5px] rounded-[5px]"
              >
                <audio controls>
                  <source src={audioUrl} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[white] px-[10px] py-0 flex justify-between items-center h-[70px]">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ef4444]"></span>
          </span>

          <div className="flex items-center gap-[10px]">
            {isRecording && <p>Time: {formatTime(recordingTime)}</p>}

            {isRecording && !isPaused && (
              <button onClick={pauseRecording}>
                <BsPauseCircleFill className="text-[#554d4d] text-[25px]" />
              </button>
            )}

            {isRecording && isPaused && (
              <button onClick={continueRecording}>
                <IoMdPlayCircle className="text-[#554d4d] text-[25px]" />
              </button>
            )}
          </div>

          {isRecording ? (
            <button
              className="bg-[#554d4d] text-[white] p-[10px] rounded-[50px]"
              onClick={stopRecording}
            >
              <BsSend />
            </button>
          ) : (
            <button
              className="bg-[#554d4d] text-[white] p-[10px] rounded-[50px]"
              onClick={startRecording}
            >
              <MdMic />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
