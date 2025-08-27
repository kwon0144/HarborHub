"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";

const HomeSections = () => {
  return (
    <div className="mb-10">
      {/* Online Resources */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="py-3 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-center">
            <div className="text-[#26435D] text-4xl font-bold pt-10">Online Resources</div>
            <Image
              className="mx-auto w-4/5 sm:w-3/4 md:w-2/3 lg:w-1/2 h-auto object-contain"
              src="/home/onlineResources.png"
              alt="Online Resources Image"
              width={1200}
              height={800}
            />
          </div>
          <div className="flex items-center justify-center">
            <div>
              <div className="text-lg pb-2">
                Explore our Online Resources, offering a wide range of tools to support your mental wellness journey. Discover guided meditations that help calm the mind, breathing exercises to reduce stress and improve focus, and stress management techniques designed to enhance your overall well-being. Start your path to a healthier, balanced life today.
              </div>
              <div className="pt-2 flex justify-center lg:justify-start">
                <Button
                  component={Link}
                  href="/online-resources"
                  variant="contained"
                  sx={{
                    bgcolor: '#26435D',
                    color: 'white',
                    fontWeight: 'bold',
                    width: '140px',
                    height: '40px',
                    '&:hover': {
                      bgcolor: '#1a2d3d'
                    }
                  }}
                >
                  Read More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engaging Activities */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex items-center justify-center order-2 lg:order-1">
            <div>
              <div className="text-lg pb-2">
                Our Engaging Activities service offers a variety of opportunities to connect with peers while focusing on mental wellness. Join our interactive workshops, group meditation sessions, and creative expression classes designed to foster community and personal growth. These activities provide a supportive environment to learn, share, and enhance your mental well-being together.
              </div>
              <div className="pt-2 flex justify-center lg:justify-start">
                <Button
                  component={Link}
                  href="/engaging-activities"
                  variant="contained"
                  sx={{
                    bgcolor: '#26435D',
                    color: 'white',
                    fontWeight: 'bold',
                    width: '140px',
                    height: '40px',
                    '&:hover': {
                      bgcolor: '#1a2d3d'
                    }
                  }}
                >
                  Read More
                </Button>
              </div>
            </div>
          </div>
          <div className="text-center order-1 lg:order-2">
          <div className="text-[#26435D] text-4xl font-bold pt-10">Engaging Activities</div>
            <Image
              className="mx-auto w-4/5 sm:w-3/4 md:w-2/3 lg:w-1/2 h-auto object-contain"
              src="/home/engagingActivities.png"
              alt="Engaging Activities Image"
              width={1200}
              height={800}
            />
          </div>
        </div>
      </div>

      {/* Booking Therapy */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-center">
            <div className="text-[#26435D] text-4xl font-bold pt-10">Booking Therapy</div>
            <Image
              className="mx-auto w-4/5 sm:w-3/4 md:w-2/3 lg:w-1/2 h-auto object-contain"
              src="/home/bookingTherapy.png"
              alt="Booking Therapy Image"
              width={1200}
              height={800}
            />
          </div>
          <div className="flex items-center justify-center">
            <div>
              <div className="text-lg pb-2">
                Our Booking Therapy service makes it easy to schedule appointments with qualified mental health professionals for personalized consultations. Whether you need support with stress, anxiety, or any other mental health concerns, our platform connects you with experienced doctors, offering convenient online booking to ensure you receive the care you need promptly.
              </div>
              <div className="pt-2 flex justify-center lg:justify-start">
                <Button
                  component={Link}
                  href="/booking-therapy"
                  variant="contained"
                  sx={{
                    bgcolor: '#26435D',
                    color: 'white',
                    fontWeight: 'bold',
                    width: '140px',
                    height: '40px',
                    '&:hover': {
                      bgcolor: '#1a2d3d'
                    }
                  }}
                >
                  Read More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSections;


