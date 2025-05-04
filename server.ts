import express from 'express';
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const storage = new Storage();
const visionClient = new ImageAnnotatorClient();


const LIKELIHOOD_STRINGS: ReadonlyArray<string> = [
    "UNKNOWN",
    "VERY_UNLIKELY",
    "UNLIKELY",
    "POSSIBLE",
    "LIKELY",
    "VERY_LIKELY",
];

const LIKELY_THRESHOLD: string = 'LIKELY';

function isLikelyOrHigher(
    likelihood: protos.google.cloud.vision.v1.Likelihood | string | null | undefined 
): boolean {

    const likelihoodStr = typeof likelihood === 'string'
        ? likelihood
        : (likelihood != null ? LIKELIHOOD_STRINGS[likelihood] : "UNKNOWN") ?? "UNKNOWN";

    const thresholdIndex = LIKELIHOOD_STRINGS.indexOf(LIKELY_THRESHOLD);
    const valueIndex = LIKELIHOOD_STRINGS.indexOf(likelihoodStr);

    return valueIndex !== -1 && thresholdIndex !== -1 && valueIndex >= thresholdIndex;
}


app.post('/moderate', async (req, res) => {
    console.log("Received moderation request body:", req.body);

    if (!req.body || !req.body.message || !req.body.message.data) {
        console.error('Invalid Pub/Sub message format');
        return res.status(400).send('Bad Request: Invalid Pub/Sub message format');
    }

    let eventData;
    try {
         const messageData = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
         eventData = JSON.parse(messageData);
         console.log("Parsed storage event data:", eventData);
    } catch (e) {
        console.error("Error decoding/parsing Pub/Sub message:", e)
        return res.status(400).send('Bad Request: Could not parse message data');
    }


    const bucketName = eventData.bucket;
    const filePath = eventData.name;
    const contentType = eventData.contentType;
    const metadata = eventData.metadata || {};

    if (!filePath || !contentType || !bucketName) { console.log("Missing file details."); return res.status(200).send('OK: Missing file details'); }
    if (!filePath.startsWith("discussionsMedia/")) { console.log(`File ${filePath} is not in discussionsMedia/.`); return res.status(200).send('OK: File ignored (path)'); }
    if (!contentType.startsWith("image/") && !contentType.startsWith("video/")) { console.log(`File ${filePath} is not an image or video.`); return res.status(200).send('OK: File ignored (type)'); }
    if (metadata?.moderated === 'true') { console.log(`File ${filePath} already moderated.`); return res.status(200).send('OK: Already moderated'); }


    console.log(`Analyzing ${filePath} (${contentType}).`);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    const gcsUri = `gs://${bucketName}/${filePath}`;
    let needsDeletion = false;

    try {
        if (contentType.startsWith("image/")) {
            const [result] = await visionClient.safeSearchDetection(gcsUri);
            const safeSearchResult = result.safeSearchAnnotation;

            if (safeSearchResult) {
                console.log(`SafeSearch results for ${filePath}:`, {
                    adult: safeSearchResult.adult,
                    violence: safeSearchResult.violence,
                    racy: safeSearchResult.racy,
                });
                // Using the helper function for comparison
                if (
                    isLikelyOrHigher(safeSearchResult.adult) ||
                    isLikelyOrHigher(safeSearchResult.violence) ||
                    isLikelyOrHigher(safeSearchResult.racy)
                   ) {
                    needsDeletion = true;
                    console.warn(`Inappropriate content detected in ${filePath}. Flagging for deletion.`);
                }
            }
        } else if (contentType.startsWith("video/")) {
            console.log(`Video moderation for ${filePath} skipped in this example.`);
        }

        if (needsDeletion) {
            console.log(`Deleting ${filePath} due to moderation.`);
            await file.delete();
            console.log(`Successfully deleted ${filePath}.`);
        } else {
            await file.setMetadata({ metadata: { ...metadata, moderated: 'true', moderationStatus: 'SAFE' } });
            console.log(`File ${filePath} marked as safe.`);
        }
        res.status(200).send('OK: Processed successfully');

    } catch (error) {
        console.error(`Error during moderation for ${filePath}:`, error);
        res.status(200).send(`OK: Processed with internal error`);
    }
});

app.get('/', (req, res) => { res.send('Moderation service is running.'); });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });