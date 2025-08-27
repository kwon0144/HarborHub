import StarRating from './StarRating';
import { Button } from '@mui/material';

export default function ResourceSection({ 
  title, 
  resources, 
  averageScores, 
  onResourceClick, 
  imageSrc, 
  imageAlt,  
  imagePosition = 'left' 
}) {
  const renderContent = () => {
    if (imagePosition === 'right') {
      return (
        <>
          <div className="resource-container w-full lg:w-1/2 flex items-center justify-center order-2 lg:order-1">
              <ul className="pt-12 pr-5 w-full">
                {resources.map((resource) => (
                  <li key={resource.id} className="list-none mb-5">
                    <div className="resource-content border-2 border-solid border-[#26435D] rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row">
                        <div className="resource-info w-full lg:w-[70%]">
                          <div className="resource-title text-xl lg:text-2xl text-[#26435D] font-bold pt-1 pl-0 lg:pl-5 text-center lg:text-left">
                            {resource.title}
                          </div>
                          <div className="resource-detail pl-0 lg:pl-5 pb-2 text-center lg:text-left">
                            {resource.brief}
                          </div>
                        </div>
                        <div className="resource-interaction w-full lg:w-[30%] pt-2 text-center lg:text-end">
                          <div className="button-position flex items-center justify-center">
                            <Button 
                              variant="contained"
                              onClick={() => onResourceClick(resource)}
                              sx={{
                                bgcolor: '#26435D',
                                color: 'white',
                                fontWeight: 'bold',
                                width: { xs: '100%', lg: '9rem' },
                                height: '40px',
                                '&:hover': { bgcolor: '#1a2d3f' }
                              }}
                            >
                              Start
                            </Button>
                          </div>
                          <div className="rating-stars flex items-center justify-center pt-1 pb-2">
                            <StarRating 
                              rating={parseFloat(averageScores[resource.id]?.averageRating) || 0}
                              readOnly={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
          </div>
          <div className="content-container w-full lg:w-1/2 text-center order-1 lg:order-2 items-center justify-center">
            <div className="content-title text-3xl lg:text-4xl font-bold text-[#26435D] pt-6 lg:pt-10">
              {title}
            </div>
            <img className="content-image w-4/5 mx-auto" src={imageSrc} alt={imageAlt} />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="content-container w-full lg:w-1/2 text-center order-1">
            <div className="content-title text-3xl lg:text-4xl font-bold text-[#26435D] pt-6 lg:pt-10">
              {title}
            </div>
            <img className="content-image w-4/5 mx-auto" src={imageSrc} alt={imageAlt} />
          </div>
          <div className="resource-container w-full lg:w-1/2 flex items-center justify-center order-2">
              <ul className="pt-12 pr-5 w-full">
                {resources.map((resource) => (
                  <li key={resource.id} className="list-none mb-5">
                    <div className="resource-content border-2 border-solid border-[#26435D] rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row">
                        <div className="resource-info w-full lg:w-[70%]">
                          <div className="resource-title text-xl lg:text-2xl text-[#26435D] font-bold pt-1 pl-0 lg:pl-5 text-center lg:text-left">
                            {resource.title}
                          </div>
                          <div className="resource-detail pl-0 lg:pl-5 pb-2 text-center lg:text-left">
                            {resource.brief}
                          </div>
                        </div>
                        <div className="resource-interaction w-full lg:w-[30%] pt-2 text-center lg:text-end">
                          <div className="button-position flex items-center justify-center">
                            <Button 
                              variant="contained"
                              onClick={() => onResourceClick(resource)}
                              sx={{
                                bgcolor: '#26435D',
                                color: 'white',
                                fontWeight: 'bold',
                                width: { xs: '100%', lg: '9rem' },
                                height: '40px',
                                '&:hover': { bgcolor: '#1a2d3f' }
                              }}
                            >
                              Start
                            </Button>
                          </div>
                          <div className="rating-stars flex items-center justify-center pt-1 pb-2">
                            <StarRating 
                              rating={parseFloat(averageScores[resource.id]?.averageRating) || 0}
                              readOnly={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
          </div>
        </>
      );
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mobile-title block lg:hidden text-3xl lg:text-4xl font-bold text-[#26435D] text-center mb-6">
        {title}
      </div>
      <div className="flex flex-col lg:flex-row">
        {renderContent()}
      </div>
    </div>
  );
}
