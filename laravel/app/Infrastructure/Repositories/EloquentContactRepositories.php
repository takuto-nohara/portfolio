<?php
namespace App\Infrastructure\Repositories;
use App\Domain\Entities\Contact as ContactEntity;
use App\Models\Contact as ContactModel;
use App\Domain\Repositories\ContactRepositoryInterface;

class EloquentContactRepositories implements ContactRepositoryInterface
{
    private function toEntity(ContactModel $model): ContactEntity
    {
        return new ContactEntity(
            id: $model->id,
            name: $model->name,
            email: $model->email,
            message: $model->message,
            createdAt: $model->created_at?->toDateTimeString(),
            updatedAt: $model->updated_at?->toDateTimeString()
        );
    }

    public function save(ContactEntity $contact): ContactEntity
    {
        $model = new ContactModel();
        $model->name = $contact->name;
        $model->email = $contact->email;
        $model->message = $contact->message;
        $model->save();
        return $this->toEntity($model);
    }

    public function findAll(): array
    {
        return ContactModel::query()
            ->latest()
            ->get()
            ->map(fn (ContactModel $model): ContactEntity => $this->toEntity($model))
            ->all();
    }

    public function delete(int $id): void
    {
        ContactModel::destroy($id);
    }
}
