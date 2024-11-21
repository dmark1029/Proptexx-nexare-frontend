"use client";
import React, { useCallback, useRef, useState } from "react";
import "../../styles/ImageCompliance.css";
import { useDropzone } from "react-dropzone";
import Stepper from "@/components/Stepper";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import StepOne from "@/components/StepOne";
import {
  objectDummymask,
  ComplianceImageUrlsBefore2,
} from "@/utils/imagesPath";
import { toast } from "react-toastify";
import { whiteLabeled } from "@/utils/sampleData";
import CTAModal from "@/components/CTAModal";
import { dummySmart } from "@/utils/dummySmart";
import { RiGalleryFill } from "react-icons/ri";
import { dummyCompliance } from "@/utils/dummySmart copy";
import Translate from "@/components/Translate";
import { setUser } from "@/Redux/slices/authSlice";

const SmartDetection = () => {
  const [lastClicked, setLastClicked] = useState("forward");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0); // Set default index
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    ComplianceImageUrlsBefore2[0]
  );
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [detect, setDetect] = useState(null);
  const [boundryBoxes, setBoundryBoxes] = useState(null);
  const original = useRef(ComplianceImageUrlsBefore2[0]);
  const timerRef = useRef(null);
  const regenerateRef = useRef(false);
  const regenRef = useRef(0);
  const { token, user } = useSelector((state) => state.auth.user);
  let userDetail = useSelector((state) => state.auth.user);
  const router = useRouter();
  let free = user?.planName == "free" || !token ? true : false;
  const onecredit = user?.usercredit?.imageComplianceCredit;
  const [upload, setUpload] = useState(false);

  const imageUrlsBefore = [
    "compliance/cb1.jpeg",
    "compliance/cb2.jpg",
    "compliance/cb3.jpg",
    "compliance/cb4.jpg",
    "compliance/cb5.jpg",
    "compliance/cb6.jpg",
  ];
  const imageUrlsAfter = [
    "compliance/ca1.png",
    "compliance/ca2.png",
    "compliance/ca3.png",
    "compliance/ca4.png",
    "compliance/ca5.png",
    "compliance/ca6.png",
  ];
  const steps = [
    {
      name: "Upload Image",
    },
    {
      name: "Review Result",
    },
  ];

  ////////////////////Cutome Function///////////////////////////////////////////////////////////////////////
  const handelSubmit3 = async () => {
    let dummyIndex = null;

    if (original.current == ComplianceImageUrlsBefore2[0]) {
      dummyIndex = 0;
    } else if (original.current == ComplianceImageUrlsBefore2[1]) {
      dummyIndex = 1;
    } else if (original.current == ComplianceImageUrlsBefore2[2]) {
      dummyIndex = 2;
    } else if (original.current == ComplianceImageUrlsBefore2[3]) {
      dummyIndex = 3;
    } else if (original.current == ComplianceImageUrlsBefore2[4]) {
      dummyIndex = 4;
    } else if (original.current == ComplianceImageUrlsBefore2[5]) {
      dummyIndex = 5;
    }

    setBoundryBoxes(dummyCompliance[dummyIndex].boundryBoxes);
    setWidth(dummyCompliance[dummyIndex].imageWidth);
    setHeight(dummyCompliance[dummyIndex].imageHeight);
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  };

  const groupObjectsByModel = (objects) => {
    if (!objects.length) {
      return null;
    }
    return objects.reduce((acc, obj) => {
      // Replace underscores with spaces
      const formattedModelName = obj.modelName.replace(/_/g, " ");
      if (!acc[formattedModelName]) {
        acc[formattedModelName] = [];
      }
      acc[formattedModelName].push({ class: obj.class, score: obj.score });
      return acc;
    }, {});
  };

  //////////////////////////////////////////////////////////////////////////
  const getRandomColor = () => {
    // Generate random values for RGB components
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    // Create a CSS color string using RGB values
    return `rgb(${r},${g},${b})`;
  };
  const predefinedColors = [
    "red",
    "purple",
    "blue",
    "green",
    "purple",
    "orange",
  ];

  const renderBoundingBoxes = () => {
    if (!boundryBoxes) {
      return;
    }
    let imageWidth = width;
    let imageHeight = height;

    return boundryBoxes.map((bbox, index) => {
      const {
        result,
        bbox: [x1, y1, x2, y2],
      } = bbox;

      // Calculate the coordinates and dimensions of the bounding box
      const leftPercentage = (x1 / imageWidth) * 100;
      const topPercentage = (y1 / imageHeight) * 100;
      const widthPercentage = ((x2 - x1) / imageWidth) * 100;
      const heightPercentage = ((y2 - y1) / imageHeight) * 100;
      const randomColor = predefinedColors[index % predefinedColors.length];

      // Define the style for the bounding box using percentages
      const boundingBoxStyle = {
        position: "absolute",
        left: `${leftPercentage}%`,
        top: `${topPercentage}%`,
        width: `${widthPercentage}%`,
        height: `${heightPercentage}%`,
        border: `3px solid ${randomColor}`,
      };

      return (
        <div
          key={index}
          className="bounding-box flex flex-col items-start"
          style={boundingBoxStyle}
        >
          <span className="label !bg-mainColor text-[#ffffff] p-[3px_5px] mt-[-35px] ml-[-2px] h-[30px] text-[0.9rem] rounded-[2px]">
            <Translate text={result} />
          </span>
        </div>
      );
    });
  };

  /////////////////////////////////////set required data in local ended////////////////////////////////////////////

  const handleForwardClick = () => {
    setCurrentIndex((currentIndex + 1) % imageUrlsBefore.length);
    setLastClicked("forward"); // Go to next image
  };
  const handleBackClick = () => {
    setCurrentIndex(
      (currentIndex - 1 + imageUrlsBefore.length) % imageUrlsBefore.length
    ); // Go to previous image
    setLastClicked("back");
  };
  ///////////////////back and forward image click ended///////////////////////////////////
  const nextPage = () => {
    setStep((prevStep) => prevStep + 1);
  };
  const prevPage = () => {
    if (step == 2) {
      regenerateRef.current = false;
    }
    if (step == 1) {
      regenerateRef.current = false;
      localStorage.removeItem("objectremoval2");
    } else {
      if (!loading) {
        setStep((prevStep) => prevStep + -1);
      }
    }
  };

  ////////////////////back and forward button ended////////////////////////////////////

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);

      image.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = image;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.75
        );
      };

      image.onerror = (err) => {
        reject(err);
        console.log(err, "error");
      };
    });
  };

  function generateRandomTimeName() {
    const timestamp = Date.now(); // Current time in milliseconds since 1970
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    return `${timestamp}-${randomNum}`;
  }

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setLoading(true);
    original.current = " ";
    if (file) {
      setLoading(true);
      newFileUpload(file);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const handleImageClickme = () => {
    setIsVisible(!isVisible); // Toggle visibility state when image is clicked
  };
  const newFileUpload = async (file) => {
    let fileimg = file;
    if (file && file.size > 1048576) {
      // 1 MB in bytes
      const resizedBlob = await resizeImage(file, 1920, 1920);
      const randomName = generateRandomTimeName();
      const resizedFile = new File([resizedBlob], `${randomName}${file.name}`, {
        type: "image/jpeg",
      });
      fileimg = resizedFile;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current); // clear existing timer
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.type)) {
      handelNewFileUpload(fileimg);
    } else {
      alert("Unsupport Format");
      setLoading(false);
    }
  };
  const handelNewFileUpload = async (fileimg) => {
    const ApiKey = process.env.REACT_APP_API_KEY;
    if (!fileimg) return;
    const formData = new FormData();
    formData.append("image", fileimg);

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URI}/api/models/uploadimage?modelName=imageComplianceCredit`,
      {
        method: "POST",
        headers: {
          "x-api-key": ApiKey,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )
      .then((res) => res.json())
      .then((data) => {
        original.current = data.fileurl;
        setSelectedImage(data.fileurl);
        regenRef.current = 0;
        if (original.current) {
          original.current = data.fileurl;
          regenerateRef.current = false;
          nextPage();
          handelSubmit2(data.fileurl);
          if (onecredit) {
            setUpload(true);
          }
          dispatch(
            setUser({
              token,
              user: data?.user,
            })
          );
        } else {
          toast.error("Failed to upload");
          setLoading(false);
        }
      })
      .catch((err) => toast.error("Failed to upload"));
  };

  ///////////////////////////upload mask on s3 ennded/////////////////////////////

  const handlePositionChange = useCallback((position) => {
    setSliderPosition(position);
  }, []);

  const handelImageSelect = (image) => {
    original.current = "";
    original.current = image;
    setSelectedImage(image);
  };

  const handleImageClick = () => {
    regenRef.current = 0;
    regenerateRef.current = false;
    setLoading(true);
    nextPage();
    if (free && !onecredit && !upload) {
      const filterImage = objectDummymask.find(
        (item, index) => item.image == selectedImage
      );
      handelSubmit3();
    } else {
      handelSubmit2();
    }
  };

  /////////////////list room and architecture_style list ended//////////////////////////////

  const handelSubmit2 = async () => {
    setLoading(true);
    let formData = {};

    formData = {
      image_url: original.current,
      modelName: "imageComplianceCredit",
    };
    fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/models/compliancedetection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        const errorMessage = data?.message;
        if (errorMessage) {
          if (errorMessage === "Token verification failed") {
            toast.error(`Login Expire, Please login again`);
            dispatch(setUser({}));
            setLoading(false);
            setStep(1);
            return;
          }
        }
        if (!data?.success) {
          setLoading(false);
          setStep(1);
          setUpload(false);
          if (data?.message) {
            toast.error(data?.message);
          } else {
            toast.error("Failed To Detect");
          }
          return;
        }
        setBoundryBoxes(data?.boundryBoxes);
        setWidth(data?.imageWidth);
        setHeight(data?.imageHeight);
        setLoading(false);
        if (free && upload) {
          dispatch(
            setUser({
              ...userDetail,
              user: {
                ...userDetail.user,
                usercredit: {
                  ...userDetail?.user?.usercredit,
                  imageComplianceCredit: 0,
                },
              },
            })
          );
        } else {
          dispatch(
            setUser({
              token,
              user: data.user,
            })
          );
        }
      })
      .catch((error) => {
        setLoading(false);
        const errorMessage = error?.response?.data?.message;
        if (errorMessage) {
          if (errorMessage === "Token verification failed") {
            toast.error(`Login Expire, Please login again`);
            dispatch(setUser({}));
          }
        } else {
          toast.error("Failed To Detect");
        }
        setStep(1);
      });
  };

  return (
    <div className="flex flex-col max-w-[1100px] m-[50px_auto] w-[90%]">
      <p
        className={`backtoStep`}
        onClick={() => {
          if (step === 1) {
            router.push("/");
            localStorage.removeItem("objectremoval2");
          } else if (step == 2) {
            original.current = "";
            setSelectedImage(null);
            regenerateRef.current = false;
            prevPage();
          } else if (step == 3 && free == true && !onecredit && !upload) {
            setStep(1);
            localStorage.removeItem("objectremoval2");
            regenRef.current = 0;
          } else {
            prevPage();
          }
        }}
      >
        <svg
          className="backtoStepsvg"
          viewBox="0 0 26 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.9551 19.0566L7.68829 11.3378C7.42422 11.1042 7.31251 10.7996 7.31251 10.4999C7.31251 10.2003 7.42362 9.89667 7.64573 9.66206L14.9551 1.94331C15.4223 1.45428 16.1941 1.43397 16.6816 1.89557C17.1742 2.35921 17.1895 3.13362 16.7273 3.61909L10.2121 10.4999L16.7324 17.3808C17.1942 17.8664 17.1768 18.6376 16.6848 19.1043C16.1941 19.5644 15.4223 19.5441 14.9551 19.0566Z"
            fill={whiteLabeled ? "#c82021" : "#000000"}
          />
        </svg>{" "}
        {free == true && step == 3 && !onecredit && !upload ? (
          <Translate text="Back to upload" />
        ) : step === 1 ? (
          <Translate text="Back to store" />
        ) : (
          <Translate text={`Back to Step ${step - 1}`} />
        )}
      </p>

      {/*///////////////////////////////////////////////// top progress bar     /////////////////////////////*/}
      <div className="virtualStagingParaBox">
        <p className="virtualStagingPara">
          <RiGalleryFill />
          <span className="ml-[10px]">
            <Translate text="Image Compliance Check" />
          </span>
        </p>

        {/*///////////////////////////////////////////////// end     /////////////////////////////*/}

        {/* 2nd page */}
        {step == 2 && (
          <div>
            <>
              <Stepper
                stepperClass="SmartStepBoxText"
                progressSteps={steps}
                step={step}
              />
            </>
            <p className="step5Para !text-mainColor">
              <Translate text="Step 2" />{" "}
              <span className="step3ParaSpan">
                - <Translate text="Review Result" />
              </span>
            </p>

            <div className="grid grid-cols-[1fr] md:!grid-cols-[300px_1fr] items-start gap-10 mt-[30px]">
              <div className="!bg-[#f7f7f7] flex flex-col items-center rounded-[10px] pt-[20px] border border-[#e5e5e5]">
                {loading ? (
                  <div
                    className="spinner spinner_black mx-3 mb-[20px]"
                    id="spinner"
                  ></div>
                ) : (
                  <div className="max-w-[90%] w-[100%] m-auto flex flex-col">
                    <div className="w-[100%] flex flex-col items-start">
                      <h3 className="w-full p-[7px_20px] text-[0.9rem] !bg-mainColor text-white border-b border-[#e5e5e5] rounded-[3px] flex justify-center items-center capitalize font-[500]">
                        <Translate text="Detected Objects" />
                      </h3>
                      {boundryBoxes?.length == 0 ? (
                        <>
                          <span
                            style={{
                              color: "#333333",
                              paddingBottom: "20px",
                              paddingTop: "10px",
                              margin: "auto",
                            }}
                          >
                            <Translate text="No Object Detected" />
                          </span>
                          <br />
                        </>
                      ) : (
                        <div className="flex w-full flex-wrap justify-start items-center gap-2 mt-[10px] pb-[10px] mb-[10px]">
                          {boundryBoxes?.length > 0 &&
                            Object.entries(boundryBoxes).map(
                              ([key, obj], idx) => (
                                <span
                                  key={idx}
                                  className="!bg-[#EAEEFF] capitalize text-[0.8rem] p-[7px_10px] rounded-[30px] text-[#404040] flex justify-center items-center border border-[#e6e6e6]"
                                >
                                  <Translate text={obj.result} />{" "}
                                  {/* Render the 'result' property */}
                                </span>
                              )
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="!bg-[#f3f3f3] w-full relative flex justify-center items-center rounded-[15px]">
                {loading ? (
                  <img
                    className="w-[100%] max-w-[300px] py-[20px] max-h-[200px] object-contain object-center h-[100%]"
                    src="/loading-nexare.gif"
                    alt="loading"
                    style={{ filter: "brightness(0%)" }}
                  />
                ) : (
                  <div className="w-full border">
                    <img
                      className="w-full flex object-cover border"
                      src={original.current}
                      alt="Smart Detections"
                    />
                    {renderBoundingBoxes()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* step 1 */}
        {step == 1 && (
          <>
            <StepOne
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              mainText="82% of buyers’ agents said staging made it easier for a buyer to visualize the property as a future home"
              handlePositionChange={handlePositionChange}
              handleBackClick={handleBackClick}
              handleForwardClick={handleForwardClick}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              selectedImage={selectedImage}
              handelImageSelect={handelImageSelect}
              handleImageClick={handleImageClick}
              sliderPosition={sliderPosition}
              setIsVisible={setIsVisible}
              isVisible={isVisible}
              lastClicked={lastClicked}
              imageUrlsBefore2={ComplianceImageUrlsBefore2}
              imageUrlsBefore={imageUrlsBefore}
              imageUrlsAfter={imageUrlsAfter}
              free={free}
              step={step}
              loading={loading}
              NameModel="imageComplianceCredit"
              downSlide={{
                mainHeading: "How it works text in compliance detection",
                toolSteps: [
                  {
                    image: "/compliance/compliance_card1.png",
                    title: "Click to upload image",
                  },
                  {
                    image: "/compliance/compliance_card2.png",
                    title: "Detect compliance in a photo",
                  },
                ],
              }}
              modelName="Image Compliance"
            />
          </>
        )}
      </div>
      <CTAModal open={open} setOpen={setOpen} stepsData={{ step }} />
    </div>
  );
};

export default SmartDetection;