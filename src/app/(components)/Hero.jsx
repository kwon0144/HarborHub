import React from 'react'

const Hero = () => {
  return (
      <div className="text-white" style={{ backgroundColor: "var(--hero-bg)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="pb-2">
              <img
                src="/logo/logo_white.png"
                alt="HarborHub Whitespace Logo"
                className="mx-auto w-[300px]"
              />
            </div>
            <div className="text-lg sm:text-xl">
              A comprehensive web app for mental wellness, offering comprehensive range of
            </div>
            <div className="text-lg sm:text-xl">
              services and resources in one place to help you find peace and balance in daily life.
            </div>

            <div>
            </div>
          <div className="h-6" />
        </div>
      </div>
  )
}

export default Hero