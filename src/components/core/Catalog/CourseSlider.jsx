import React from 'react'
import {Swiper, SwiperSlide} from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { Autoplay, FreeMode, Navigation, Pagination, Mousewheel, Keyboard} from 'swiper/modules'
import Course_Card from './Course_Card'

const CourseSlider = ({Courses}) => {

    return (
        <>
            {
                Courses?.length ? (
                    <Swiper
                        // spaceBetween={30}
                        // centeredSlides={true}
                        // autoplay={{
                        //     delay: 2500,
                        //     disableOnInteraction: false,
                        // }}
                        // pagination={{
                        //     clickable: true,
                        // }}
                        // navigation={true}
                        // modules={[Autoplay, Pagination, Navigation]}
                        // // className="mySwiper max-h-[720px] max-w-[480px]"
                        // breakpoints={{
                        //     300:{slidesPerView:2, spaceBetween:10,},
                        //     640:{slidesPerView:2,},
                        //     1024:{slidesPerView:3,}
                        // }}
                        mousewheel={
                            {
                                enabled: true,
                                forceToAxis: true,
                            } 
                        }
                        keyboard={
                            {
                                enabled: true,
                                onlyInViewport: true,
                            }
                        }
                        allowSlidePrev={true}
                            slidesPerView={1}
                            loop={false}
                            spaceBetween={20}
                            pagination={true}
                            modules={[Pagination,Navigation,FreeMode,Mousewheel,Keyboard]}
                            className="mySwiper md:pt-5"
                            // autoplay={{
                            // delay: 1000,
                            // disableOnInteraction: false,
                            // }}
                            style={{
                                "--swiper-navigation-size": "20px",
                            }}
                            freeMode={true}
                            navigation={true}
                            // navigation={
                            //     {
                            //         nextEl: ".swiper-button-next",
                            //         prevEl: ".swiper-button-prev",
                            //     }
                            // }
                            breakpoints={{
                                300:{slidesPerView:2.1,spaceBetween:10,},
                                640:{slidesPerView:2.2,},
                                1024:{slidesPerView:3.1,}
                            }
                        }
                    
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
