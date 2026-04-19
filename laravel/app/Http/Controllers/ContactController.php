<?php

namespace App\Http\Controllers;

use App\UseCases\Contact\SendContactUseCase;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function __construct(
        private SendContactUseCase $sendContactUseCase
    ) {}

    public function index()
    {
        return view('contact.index');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        $this->sendContactUseCase->execute(
            name: $request->input('name'),
            email: $request->input('email'),
            message: $request->input('message')
        );

        return redirect()->route('contact.index')->with('success', 'お問い合わせを送信しました。');

    }
}
