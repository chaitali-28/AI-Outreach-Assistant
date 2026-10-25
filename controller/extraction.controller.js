

import Extraction from "../models/extraction.model.js";
import { extractWithAi } from "../utils/ai.utils.js";

export const extractContent = async (req, res) => {
  try {
    // Step 1: Check whether a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required"
      });
    }

    // Step 2: Check whether authentication provided a user
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Step 3: Convert the uploaded image into Base64
    const base64 = req.file.buffer.toString("base64");

    const imageData =
      `data:${req.file.mimetype};base64,${base64}`;

    // Step 4: Prepare the AI prompt
    const prompt = `
      Analyze this image and extract visible information.

      If it contains a resume, extract:
      - Name
      - Email
      - Phone
      - Skills
      - Education
      - Experience
      - Projects

      If it contains a LinkedIn recruitment post, extract:
      - Recruiter email, if visible
      - Recruiter or author name
      - Company
      - Job role
      - Required skills
      - Post content

      Return valid JSON.
      Use null for missing information.
      Do not invent or guess information.
    `;

    // Step 5: Send the prompt and image to the AI
    const extractContentWithAi = await extractWithAi(
      prompt,
      imageData
    );

    // Step 6: Parse the AI response as JSON
    let parsedData;

    try {
      const jsonMatch =
        extractContentWithAi.match(/\{[\s\S]*\}/);

      const toParse = jsonMatch
        ? jsonMatch[0]
        : extractContentWithAi;

      parsedData = JSON.parse(toParse);
    } catch (parseError) {
      console.error(
        "Error while parsing AI response:",
        parseError.message
      );

      parsedData = {
        rawContent: extractContentWithAi
      };
    }

    // Step 7: Save the extraction in MongoDB
    const savedExtraction = await Extraction.create({
      data: parsedData,
      rawContent: extractContentWithAi,
      createdBy: req.user._id
    });

    // Step 8: Send the successful response
    return res.status(200).json({
      success: true,
      message: "Extraction successful",
      savedExtraction
    });

  } catch (error) {
    console.error("Extraction error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

