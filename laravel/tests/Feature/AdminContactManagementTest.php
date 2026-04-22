<?php

namespace Tests\Feature;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminContactManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_contact_list(): void
    {
        config(['auth.admin_emails' => ['admin@example.com']]);

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
        ]);

        Contact::query()->create([
            'name' => 'Hanako',
            'email' => 'hanako@example.com',
            'message' => 'First contact message',
        ]);

        Contact::query()->create([
            'name' => 'Taro',
            'email' => 'taro@example.com',
            'message' => 'Second contact message',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.contacts.index'));

        $response->assertOk();
        $response->assertSee('Hanako');
        $response->assertSee('Taro');
    }

    public function test_admin_can_delete_contact(): void
    {
        config(['auth.admin_emails' => ['admin@example.com']]);

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
        ]);

        $contact = Contact::query()->create([
            'name' => 'Hanako',
            'email' => 'hanako@example.com',
            'message' => 'Delete me',
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.contacts.destroy', $contact->id));

        $this->assertSame(302, $response->getStatusCode());
        $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
    }
}
