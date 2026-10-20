const express = require("express")
const { default: authMiddleware } = require("../middlewares/authmiddleware")
const { createJourney, getJourneys, getJourneyById, updateJourney, deleteJourney } = require("../controllers/journey-controllers");
const {
    createJourneyEntry,
    getJourneyEntries,
    getJourneyEntryById,
    updateJourneyEntry,
    deleteJourneyEntry,
} = require("../controllers/journey-entry-controllers");

const {
    addJourneyMedia,
    deleteJourneyMedia,
} = require("../controllers/journey-media-controllers");

const {
    linkJourneyPost,
    unlinkJourneyPost,
} = require("../controllers/journey-post-controllers");
const multer = require("multer");



const storage = multer.memoryStorage()
const upload = multer({storage})



const journeyRouter = express.Router()

journeyRouter.post("/", authMiddleware, upload.single("cover"), createJourney);
journeyRouter.get("/", authMiddleware, getJourneys)
journeyRouter.get("/:journey_id", authMiddleware, getJourneyById)
journeyRouter.put("/:journeyId", authMiddleware, updateJourney);
journeyRouter.delete("/:journeyId", authMiddleware, deleteJourney);

journeyRouter.post("/:journey_id/entries", authMiddleware, createJourneyEntry)
journeyRouter.get("/:journey_id/entries", authMiddleware, getJourneyEntries)
journeyRouter.get("/:journey_id/entries/:entryId", authMiddleware, getJourneyEntryById)
journeyRouter.put("/:journey_id/entries/:entryId", authMiddleware, updateJourneyEntry)
journeyRouter.delete("/:journey_id/entries/:entryId", authMiddleware, deleteJourneyEntry)

// Journey entry media
journeyRouter.post("/:journeyId/entries/:entryId/media", authMiddleware, addJourneyMedia);
journeyRouter.delete("/:journeyId/entries/:entryId/media/:mediaId", authMiddleware, deleteJourneyMedia);

// Posts linked to Journey entries
journeyRouter.post("/:journeyId/entries/:entryId/posts", authMiddleware, linkJourneyPost);
journeyRouter.delete("/:journeyId/entries/:entryId/posts/:postId", authMiddleware, unlinkJourneyPost);

module.exports = { journeyRouter }

