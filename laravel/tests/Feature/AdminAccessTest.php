<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin_work_pages(): void
    {
        $response = $this->get(route('admin.works.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_non_admin_user_cannot_access_admin_work_pages(): void
    {
        config(['auth.admin_emails' => ['admin@example.com']]);

        $user = User::factory()->create([
            'email' => 'member@example.com',
        ]);

        $response = $this->actingAs($user)->get(route('admin.works.index'));

        $response->assertForbidden();
    }

    public function test_admin_user_can_access_admin_work_pages(): void
    {
        config(['auth.admin_emails' => ['admin@example.com']]);

        $user = User::factory()->create([
            'email' => 'admin@example.com',
        ]);

        $response = $this->actingAs($user)->get(route('admin.works.index'));

        $response->assertOk();
    }
}
