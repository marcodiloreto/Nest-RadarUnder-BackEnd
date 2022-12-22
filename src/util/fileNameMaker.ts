import { v4 as uuidv4 } from 'uuid'


export const fileNameMaker = (req, file: Express.Multer.File, cb: (error, filename) => void) => {
    const { originalname } = file;
    const splitName = originalname.split('.');
    const extension = splitName[splitName.length - 1];
    const tempName = uuidv4() + '.' + extension;
    cb(null, tempName)
}