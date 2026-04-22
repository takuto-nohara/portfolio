<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Work;
use App\Models\WorkImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WorkGalleryManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_work_with_thumbnail_and_gallery_images(): void
    {
        Storage::fake('public');
        config(['auth.admin_emails' => ['admin@example.com']]);

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.works.store'), [
            'title' => 'Portfolio App',
            'category' => 'app',
            'description' => 'Work description',
            'tech_stack' => 'Laravel, Tailwind CSS',
            'sort_order' => 1,
            'thumbnail' => $this->fakeImageUpload('thumbnail.png'),
            'images' => [
                $this->fakeImageUpload('gallery-1.png'),
                $this->fakeImageUpload('gallery-2.png'),
            ],
        ]);

        $this->assertSame(302, $response->getStatusCode());

        $work = Work::query()->first();

        $this->assertNotNull($work);
        $this->assertNotNull($work->thumbnail);
        Storage::disk('public')->assertExists($work->thumbnail);

        $images = WorkImage::query()->where('work_id', $work->id)->orderBy('sort_order')->get();

        $this->assertCount(2, $images);

        foreach ($images as $image) {
            Storage::disk('public')->assertExists($image->image_path);
        }

        $page = $this->get(route('works.show', $work->id));

        $page->assertOk();
        $page->assertSee($images[0]->image_path);
        $page->assertSee($images[1]->image_path);
    }

    public function test_admin_can_delete_a_gallery_image(): void
    {
        Storage::fake('public');
        config(['auth.admin_emails' => ['admin@example.com']]);

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
        ]);

        $work = Work::query()->create([
            'title' => 'Portfolio App',
            'category' => 'app',
            'description' => 'Work description',
            'tech_stack' => 'Laravel, Tailwind CSS',
            'sort_order' => 1,
        ]);

        Storage::disk('public')->put('works/gallery/existing.jpg', 'image-content');

        $image = WorkImage::query()->create([
            'work_id' => $work->id,
            'image_path' => 'works/gallery/existing.jpg',
            'sort_order' => 1,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.works.images.destroy', [
            'workId' => $work->id,
            'imageId' => $image->id,
        ]));

        $this->assertSame(302, $response->getStatusCode());
        $this->assertDatabaseMissing('work_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing('works/gallery/existing.jpg');
    }

    private function fakeImageUpload(string $name): UploadedFile
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9VE3toQAAAAASUVORK5CYII=', true);

        return UploadedFile::fake()->createWithContent($name, $png === false ? '' : $png);
    }
}
