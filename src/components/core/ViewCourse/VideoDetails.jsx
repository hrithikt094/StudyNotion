import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import { markLectureAsComplete } from '../../../services/operations/courseDetailsAPI';
import { updateCompletedLectures } from '../../../slices/viewCourseSlice';
import { BigPlayButton, Player } from 'video-react'
import "video-react/dist/video-react.css"
import { IoPlayCircle } from "react-icons/io5";
import IconBtn from '../../common/IconBtn';

const VideoDetails = () => {

    const {courseId, sectionId, subSectionId} = useParams();
    console.log("courseId : ", courseId);
    console.log("sectionId : ", sectionId);
    console.log("subSectionId : ", subSectionId);
    const navigate = useNavigate();
    const location = useLocation();
    const playerRef = useRef();
    const dispatch = useDispatch();
    const {token} = useSelector((state) => state.auth);
    const {courseSectionData, courseEntireData, completedLectures} = useSelector(
        (state) => state.viewCourse);
    const {user} = useSelector((state) => state.profile);
    // console.log("userId is : ", user._id);

    const [videoData, setVideoData] = useState([]);
    const [previewSource, setPreviewSource] = useState("");
    const [videoEnded, setVideoEnded] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const setVideoSpecificDetails = async () => {
            if(!courseSectionData.length) {
                return;
            }

            if(!courseId && !sectionId && !subSectionId) {
                navigate(`/dashboard/enrolled-courses`);
            }

            else {
                console.log("courseSectionData", courseSectionData)
                const filteredData = courseSectionData.filter(
                    (course) => course._id === sectionId
                );
                console.log("filteredData", filteredData)
                const filteredVideoData = filteredData?.[0]?.subSection.filter(
                  (data) => data._id === subSectionId
                )
                console.log("filteredVideoData", filteredVideoData)
                setVideoData(filteredVideoData[0])
                setPreviewSource(courseEntireData.thumbnail)
                setVideoEnded(false)
            }
        }

        setVideoSpecificDetails();

        console.log("courseSectionData here", courseSectionData);
        console.log("COMPARISON RESULT IS : ");
        console.log(courseSectionData[0]);
    }, [courseSectionData, courseEntireData, location.pathname])

    // console.log("CourseSectionData here", courseSectionData);
    // console.log("COMPARISON RESULT IS : ");
    // console.log(sectionId === courseSectionData?.[0]._id);
    
    const isFirstVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex((data) => data._id === sectionId);
        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.
        findIndex((data) => data._id === subSectionId);
        if (currentSectionIndex === 0 && currentSubSectionIndex === 0) {
            return true;
        } 
        
        else {
            return false;
        }
    }

    const isLastVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex((data) => data._id === sectionId);
        const noOfSubsections = courseSectionData[currentSectionIndex].subSection.length;
        const currentSubSectionIndex = courseSectionData[currentSectionIndex].
        subSection.findIndex((data) => data._id === subSectionId);
        if (currentSectionIndex === courseSectionData.length - 1 && 
            currentSubSectionIndex === noOfSubsections - 1) {
            return true;
        } 
        
        else {
            return false;
        }
    }

    const goToNextVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex((data) => data._id === sectionId);
        const noOfSubsections = courseSectionData[currentSectionIndex].subSection.length;
        const currentSubSectionIndex = courseSectionData[currentSectionIndex].
        subSection.findIndex((data) => data._id === subSectionId)
        // console.log("no of subsections", noOfSubsections)
        if (currentSubSectionIndex !== noOfSubsections - 1) {
            const nextSubSectionId = courseSectionData[currentSectionIndex].
            subSection[currentSubSectionIndex + 1]._id;
            navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`);
        } 
        
        else {
            const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
            const nextSubSectionId = courseSectionData[currentSectionIndex + 1].subSection[0]._id;
            navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`);
        }
    }

    const goToPrevVideo = () => {
        // console.log(courseSectionData)
        const currentSectionIndex = courseSectionData.findIndex((data) => data._id === sectionId);
        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.
        findIndex((data) => data._id === subSectionId);
        if (currentSubSectionIndex !== 0) {
            const prevSubSectionId = courseSectionData[currentSectionIndex].
            subSection[currentSubSectionIndex - 1]._id;
            navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`);
        } 
        
        else {
            const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
            const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
            const prevSubSectionId = courseSectionData[currentSectionIndex - 1].
            subSection[prevSubSectionLength - 1]._id;
            navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`);
        }
    }

    const handleLectureCompletion = async () => {
        setLoading(true);
        const res = await markLectureAsComplete({courseId: courseId, subSectionId: subSectionId,
        userId: user._id }, token);
        console.log("yeaa milgaya result completion ka ", res);
        if (res) {
            dispatch(updateCompletedLectures(subSectionId));
        }

        setLoading(false);
    }

    return (
        <div className="flex flex-col gap-5 text-white">
            {
                !videoData ? (<img
                    src={previewSource}
                    alt="Preview"
                    className="h-full w-full rounded-md object-cover"
                />)
                : (
                    <Player
                        ref={playerRef}
                        aspectRatio="16:9"
                        playsInline
                        onEnded={() => setVideoEnded(true)}
                        src={videoData?.videoUrl}
                    >
                        <BigPlayButton position="center" />

                        {
                            videoEnded && (
                                <div
                                    style={{
                                        backgroundImage: "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
                                    }}
                                    className="full absolute inset-0 z-[100] grid h-full 
                                    place-content-center gap-y-4 font-inter"
                                >
                                    {
                                        !completedLectures.includes(subSectionId) && (
                                            <IconBtn
                                                disabled={loading}
                                                onclick={() => handleLectureCompletion()}
                                                text={!loading ? "Mark As Completed" : "Loading..."}
                                                customClasses="text-xl text-center max-w-max px-4 mx-auto 
                                                mb-25"
                                            />
                                        )
                                    }

                                    <IconBtn
                                        disabled={loading}
                                        onclick={() => {
                                            if (playerRef?.current) {
                                                // set the current time of the video to 0
                                                playerRef?.current?.seek(0)
                                                setVideoEnded(false)
                                            }
                                        }}
                                        text="Rewatch"
                                        customClasses="text-xl text-center max-w-max px-4 mx-auto mt-2"
                                    />

                                    <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 
                                    text-xl">
                                        {
                                            !isFirstVideo() && (
                                                <button
                                                    disabled={loading}
                                                    onClick={goToPrevVideo}
                                                    className="blackButton"
                                                >
                                                    Prev
                                                </button>
                                            )
                                        }
                                        
                                        {
                                            !isLastVideo() && (
                                                <button
                                                    disabled={loading}
                                                    onClick={goToNextVideo}
                                                    className="blackButton"
                                                >
                                                    Next
                                                </button>
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }
                    </Player>
                )
            }

            <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
            <p className="pt-2 pb-6">{videoData?.description}</p>
        </div>
    )
}

export default VideoDetails
