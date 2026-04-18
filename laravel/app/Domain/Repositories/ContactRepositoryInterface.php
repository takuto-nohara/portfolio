<?php
namespace App\Domain\Repositories;
use App\Domain\Entities\Contact;

interface ContactRepositoryInterface
{
    public function save(Contact $contact): Contact;
}
