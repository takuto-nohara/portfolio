<?php

namespace App\Http\Controllers;

use App\UseCases\Contact\SendContactUseCase;
use App\Http\Requests\StoreContactRequest;

class ContactController extends Controller
{
    public function __construct(
        private SendContactUseCase $sendContactUseCase
    ) {}

    public function index()
    {
        return view('contact.index');
    }

    public function store(StoreContactRequest $request)
    {
        $validated = $request->validated();

        $this->sendContactUseCase->execute(
            name: $validated['name'],
            email: $validated['email'],
            message: $validated['message']
        );

        return redirect()->route('contact.index')->with('success', 'お問い合わせを送信しました。');

    }
}
