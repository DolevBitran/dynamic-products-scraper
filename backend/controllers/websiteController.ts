import { Request, Response } from 'express';
import Website, { STATUS } from '../models/Website';

/**
 * Get all websites
 * @route GET /api/websites
 * @access Private
 */
const getWebsites = async (req: Request, res: Response): Promise<void> => {
    try {
        const websites = await Website.find({});
        res.status(200).json({
            success: true,
            count: websites.length,
            websites
        });
    } catch (error: any) {
        console.error('Error fetching websites:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * Get a single website by ID
 * @route GET /api/websites/:id
 * @access Private
 */
const getWebsiteById = async (req: Request, res: Response): Promise<void> => {
    try {
        const website = await Website.findById(req.params.id);

        if (!website) {
            res.status(404).json({
                success: false,
                error: 'Website not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            website
        });
    } catch (error: any) {
        console.error('Error fetching website:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * Create a new website
 * @route POST /api/websites
 * @access Private
 */
const createWebsite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, url } = req.body;

        // Validate required fields
        if (!name || !url) {
            res.status(400).json({
                success: false,
                error: 'Please provide name and URL for the website'
            });
            return;
        }

        // Check if website with same URL already exists
        const existingWebsite = await Website.findOne({ url });
        if (existingWebsite) {
            res.status(400).json({
                success: false,
                error: 'A website with this URL already exists'
            });
            return;
        }

        const website = await Website.create({
            name,
            url,
            status: STATUS.ACTIVE
        });

        res.status(201).json({
            success: true,
            website
        });
    } catch (error: any) {
        console.error('Error creating website:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * Update a website
 * @route PUT /api/websites/:id
 * @access Private
 */
const updateWebsite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, url, description, logo, status } = req.body;

        // Find website by ID
        let website = await Website.findById(req.params.id);

        if (!website) {
            res.status(404).json({
                success: false,
                error: 'Website not found'
            });
            return;
        }

        // Check if another website with the same URL exists (if URL is being updated)
        if (url && url !== website.url) {
            const existingWebsite = await Website.findOne({ url });
            if (existingWebsite && existingWebsite._id && existingWebsite._id.toString() !== req.params.id) {
                res.status(400).json({
                    success: false,
                    error: 'A website with this URL already exists'
                });
                return;
            }
        }

        // Update website
        website = await Website.findByIdAndUpdate(
            req.params.id,
            {
                name: name || website.name,
                url: url || website.url,
                description: description !== undefined ? description : website.description,
                logo: logo !== undefined ? logo : website.logo,
                status: status || website.status
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            website
        });
    } catch (error: any) {
        console.error('Error updating website:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * Delete a website
 * @route DELETE /api/websites/:id
 * @access Private
 */
const deleteWebsite = async (req: Request, res: Response): Promise<void> => {
    try {
        const website = await Website.findById(req.params.id);

        if (!website) {
            res.status(404).json({
                success: false,
                error: 'Website not found'
            });
            return;
        }

        await website.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Website deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting website:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * Update website status
 * @route PATCH /api/websites/:id/status
 * @access Private
 */
const updateWebsiteStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;

        if (!status || !Object.values(STATUS).includes(status)) {
            res.status(400).json({
                success: false,
                error: 'Please provide a valid status'
            });
            return;
        }

        const website = await Website.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!website) {
            res.status(404).json({
                success: false,
                error: 'Website not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            website
        });
    } catch (error: any) {
        console.error('Error updating website status:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

export {
    getWebsites,
    getWebsiteById,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    updateWebsiteStatus
};
