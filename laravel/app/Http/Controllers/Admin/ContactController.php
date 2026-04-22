<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\UseCases\Contact\DeleteContactUseCase;
use App\UseCases\Contact\GetContactListUseCase;

class ContactController extends Controller
{
    public function __construct(
        private readonly GetContactListUseCase $getContactListUseCase,
        private readonly DeleteContactUseCase $deleteContactUseCase,
    ) {
    }

    public function index()
    {
        $contacts = $this->getContactListUseCase->execute();

        return view('admin.contacts.index', compact('contacts'));
    }

    public function destroy(int $id)
    {
        $this->deleteContactUseCase->execute($id);

        return redirect()->route('admin.contacts.index')->with('success', 'お問い合わせを削除しました。');
    }
}
