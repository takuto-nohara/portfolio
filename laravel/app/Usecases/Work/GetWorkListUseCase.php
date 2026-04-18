<?php
namespace App\UseCases\Contact;
use App\Domain\Repositories\ContactRepositoryInterface;
use App\Domain\ValueObjects\Category;

class GetWorkListUseCase
{
    public function __construct(
        private readonly ContactRepositoryInterface $contactRepository
    ){}

    public function execute(?Category $category = null): array
    {
        if ($category) {
            return $this->contactRepository->findByCategory($category);
        }
        return $this->contactRepository->findAll();
    }
}
