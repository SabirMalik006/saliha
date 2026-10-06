import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { parseOrThrow } from '../../utils/parse';
import { getSettingsDoc } from '../../utils/settings';
import { settingsUpdateSchema } from '../../validation/schemas';

export const settingsRouter = Router();

/** GET /admin/settings — full settings including private fields. */
settingsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const settings = await getSettingsDoc();
    res.json(settings);
  }),
);

async function applySettingsUpdate(body: unknown) {
  const payload = parseOrThrow(settingsUpdateSchema, body);
  const settings = await getSettingsDoc();

  const { social, ...rest } = payload;
  settings.set(rest);

  if (social) {
    const current = settings.social ?? { facebook: '', instagram: '', linkedin: '' };
    settings.social = {
      facebook: social.facebook ?? current.facebook,
      instagram: social.instagram ?? current.instagram,
      linkedin: social.linkedin ?? current.linkedin,
    };
  }

  await settings.save();
  return settings;
}

settingsRouter.put(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await applySettingsUpdate(req.body));
  }),
);

settingsRouter.patch(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await applySettingsUpdate(req.body));
  }),
);
