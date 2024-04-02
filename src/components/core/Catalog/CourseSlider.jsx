import React from 'react'
import {Swiper, SwiperSlide} from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { Autoplay, FreeMode, Navigation, Pagination} from 'swiper/modules'
import Course_Card from './Course_Card'

const CourseSlider = ({Courses}) => {

    return (
        <>
            {
                Courses?.length ? (
                    <Swiper
                        spaceBetween={30}
                        centeredSlides={true}
                        autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                        }}
                        pagination={{
                        clickable: true,
                        }}
                        navigation={true}
                        modules={[Autoplay, Pagination, Navigation]}
                        className="mySwiper max-h-[720px] max-w-[480px]"
                    >
                        {
                            Courses?.map((course, index) => (
                                <SwiperSlide key={index}>
                                    <Course_Card course={course} Height={"h-[250px]"} />
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
                ) : (<p className="text-xl text-richblack-5">No Course Found</p>)
            }
        </>
    )
}

export default CourseSlider
