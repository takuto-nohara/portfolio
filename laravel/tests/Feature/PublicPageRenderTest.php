<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPageRenderTest extends TestCase
{
    use RefreshDatabase;

    public function test_top_and_about_pages_render_with_profile_avatar(): void
    {
        $this->get(route('top'))
            ->assertOk()
            ->assertSee('profile');

        $this->get(route('about'))
            ->assertOk()
            ->assertSee('profile');
    }

    public function test_login_page_renders(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertSee('管理画面ログイン');
    }
}
