<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactThrottleTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_form_is_rate_limited(): void
    {
        Mail::fake();

        $payload = [
            'name' => 'Tester',
            'email' => 'tester@example.com',
            'message' => 'Hello from test.',
        ];

        for ($index = 0; $index < 10; $index++) {
            $response = $this->post(route('contact.store'), $payload);

            $this->assertNotSame(429, $response->getStatusCode());
        }

        $this->post(route('contact.store'), $payload)->assertStatus(429);
    }
}
