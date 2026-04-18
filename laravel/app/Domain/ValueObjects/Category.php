<?php
namespace App\Domain\ValueObjects;

enum Category: string
{
    case App = 'app';
    case Web = 'web';
    case Video = 'video';
    case Graphic = 'graphic';
}
