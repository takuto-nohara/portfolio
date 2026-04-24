import type {
  Contact,
  ContactRepository,
  SettingRepository,
} from "@/domain/publicApi";

import type { EmailPort } from "../../ports/EmailPort";

export class SendContactUseCase {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly emailPort: EmailPort,
    private readonly settingRepository: SettingRepository,
  ) {}

  async execute(contact: Contact): Promise<Contact> {
    const savedContact = await this.contactRepository.save(contact);
    const publicSettings = await this.settingRepository.getPublicSettings();

    if (publicSettings.contactEmail) {
      await this.emailPort.sendContactEmail(savedContact, publicSettings.contactEmail);
    }

    return savedContact;
  }
}