"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text'
import { Mic } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModal'
import moment from "moment";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import { text } from 'drizzle-orm/mysql-core'
import { UserAnswer } from "@/utils/schema";


function RecordAnswerSection({mockInterviewQuestion, activeQuestionIndex, interviewData}) {

    const [userAnswer, setUserAnswer] = useState('');
    const {user}=useUser();
    const [loading, setLoading]=useState(false);
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults

      } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
      });

    useEffect(() => {
    results.map((result) =>
        setUserAnswer((prevAns) => prevAns + result?.transcript)
    );
    }, [results]);

    useEffect(()=>{
      if(!isRecording && userAnswer.length > 5){
        UpdateUserAnswer();
      }
    },[userAnswer])

    const StartStopRecording=async ()=>{
      if(isRecording){
        
        stopSpeechToText();
        // if(userAnswer?.length<5){
        //   setLoading(false);
        //   toast('Error while saving your answer, Please record again');
        //   return ;
        // }
      }
      else{
        startSpeechToText();
      }
    }

    const UpdateUserAnswer=async()=>{
      setLoading(true);
      const feedbackPrompt = "Question:"+mockInterviewQuestion[activeQuestionIndex]?.question+
      ", User Answer:"+userAnswer+",Depends on question and user answer for given interview question " +
        " please give use rating for answer and feedback as area of improvement if any" +
        " in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";
      
      console.log(feedbackPrompt);

      const result = chatSession.sendMessage(feedbackPrompt); 
      
      const mockJsonResp=((await result).response.text()).replace('```json','').replace('```', '');
      console.log(mockJsonResp);
      const jsonFeedbackResp=JSON.parse(mockJsonResp);

      const resp=await db.insert(UserAnswer)
      .values({
        mockIdRef:interviewData?.mockId,
        question:mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns:userAnswer,
        feedback:jsonFeedbackResp?.feedback,
        rating:jsonFeedbackResp?.rating,
        userEmail:user?.primaryEmailAddress?.emailAddress,
        createdAt:moment().format('DD-MM-yyyy'),
      })
      if(resp){
          
          toast('User Answer Recorded Successfully');
          setUserAnswer('');
          setResults([])
      }
        setResults([])
      setLoading(false);
      
      // const mockJsonResp = (result.response).text().replace("```json"," "").replace("```", "");
      // console.log(mockJsonResp);
    }

  return (
    <div className='flex items-center justify-center flex-col'>
        <div className='flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5'>
            <Image src={'/webcam.png'} width={200} height={200} className='absolute' />
            <Webcam
                style={{ height: 300, width: "100%", zIndex: 10 }}
                mirrored={true}
            />
        </div>
        <Button disabled={loading} variant="outline" className="my-10"
        onClick={StartStopRecording}
        >
            {isRecording?
            <h2 className='text-red-600 flex gap-2'>
                <Mic/>Stop Recording....
            </h2> 
            :
            'Record Answer'}</Button>    
        {/* <Button onClick={()=>console.log(userAnswer )}>Show User Answer</Button> */}
    </div>
  )
}

export default RecordAnswerSection