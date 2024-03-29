<?php

/**
 * This class has been auto-generated by the Doctrine ORM Framework
 */
abstract class BaseTag extends sfDoctrineRecord
{
  public function setTableDefinition()
  {
    $this->setTableName('tag');
    $this->hasColumn('name', 'string', 100, array('type' => 'string', 'length' => '100'));
    $this->hasColumn('is_triple', 'boolean', null, array('type' => 'boolean'));
    $this->hasColumn('triple_namespace', 'string', 100, array('type' => 'string', 'length' => '100'));
    $this->hasColumn('triple_key', 'string', 100, array('type' => 'string', 'length' => '100'));
    $this->hasColumn('triple_value', 'string', 100, array('type' => 'string', 'length' => '100'));


    $this->index('name', array('fields' => 'name'));
    $this->index('triple1', array('fields' => 'triple_namespace'));
    $this->index('triple2', array('fields' => 'triple_key'));
    $this->index('triple3', array('fields' => 'triple_value'));
  }

  public function setUp()
  {
    $this->hasMany('Tagging', array('local' => 'id',
                                    'foreign' => 'tag_id'));
  }
}