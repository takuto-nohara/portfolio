<?php

namespace App\Infrastructure\Mail;

use App\Domain\Entities\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Contact $contact,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '【お問い合わせ】' . $this->contact->name . ' 様よりメッセージが届きました',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact',
        );
    }
}
